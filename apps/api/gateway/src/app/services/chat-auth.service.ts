import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ChatContact, ChatEligiblePair } from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";

export interface SessionProfile {
  _id: string;
  fullname: string;
  email: string;
  role: "student" | "tutor" | "admin";
  profilepic: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  payload?: T;
}

export interface EnrolledCourse {
  _id: string;
  coursename: string;
  tutor: { tutorid: string; tutorname: string; profilepic?: string };
  isDevelopmentEnrollment?: boolean;
}

export interface StudentChatProfile {
  userid: string;
  fullname: string;
  profilepic: string;
  enrolledCourses: { courseid: string; coursename: string }[];
}

export interface TutorCourse {
  _id: string;
  coursename: string;
  isverified: boolean;
  tutor: { tutorid: string; tutorname: string };
}

export interface AuthorizedContact {
  contact: ChatContact;
  pair: ChatEligiblePair;
}

@Injectable()
export class ChatAuthService {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
    @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
  ) {
    this.usersClient = instrumentRmqClient(this.usersClient, "users");
    this.coursesClient = instrumentRmqClient(this.coursesClient, "courses");
  }

  async sessionProfile(token: string): Promise<SessionProfile> {
    if (!token) throw new UnauthorizedException("A session is required.");
    const result = await firstValueFrom(
      this.usersClient
        .send<ApiEnvelope<SessionProfile>>("getprofile", { token })
        .pipe(timeout(8000)),
    );
    const profile = result?.payload;
    if (
      !result?.success ||
      !profile ||
      !["student", "tutor"].includes(profile.role) ||
      !profile._id
    ) {
      throw new UnauthorizedException("Your session is no longer valid.");
    }
    return profile;
  }

  async getAuthorizedContacts(
    profile: SessionProfile,
  ): Promise<AuthorizedContact[]> {
    if (profile.role === "student") {
      const enrollmentResult = await firstValueFrom(
        this.usersClient
          .send<ApiEnvelope<EnrolledCourse[]>>("getenrolledcourses", {
            studentid: profile._id,
          })
          .pipe(timeout(12000)),
      );
      if (!enrollmentResult?.success || !enrollmentResult.payload) {
        throw new BadGatewayException(
          "Could not load eligible course enrollments.",
        );
      }
      const coursesByTutor = new Map<string, EnrolledCourse[]>();
      for (const course of enrollmentResult.payload) {
        if (
          (course.isDevelopmentEnrollment &&
            !this.allowDevelopmentEnrollmentsForChat()) ||
          !course.tutor?.tutorid
        ) {
          continue;
        }
        const courses = coursesByTutor.get(course.tutor.tutorid) ?? [];
        if (!courses.some((existing) => existing._id === course._id)) {
          courses.push(course);
        }
        coursesByTutor.set(course.tutor.tutorid, courses);
      }
      return [...coursesByTutor.entries()].map(([instructorId, courses]) => {
        const tutor = courses[0].tutor;
        return {
          contact: {
            userid: instructorId,
            fullname: tutor.tutorname,
            profilepic: tutor.profilepic ?? "",
            role: "tutor",
            courses: courses.map((course) => ({
              courseid: course._id,
              coursename: course.coursename,
            })),
          },
          pair: {
            studentId: profile._id,
            instructorId,
            courseIds: courses.map((course) => course._id),
          },
        };
      });
    }

    const coursesResult = await firstValueFrom(
      this.coursesClient
        .send<ApiEnvelope<TutorCourse[]>>("chat.getTutorCourses", {
          tutorid: profile._id,
        })
        .pipe(timeout(12000)),
    );
    if (!coursesResult?.success || !coursesResult.payload) {
      throw new BadGatewayException("Could not load the tutor's courses.");
    }
    const tutorCourses = coursesResult.payload.filter(
      (course) => course.isverified && course.tutor?.tutorid === profile._id,
    );
    const courseIds = [...new Set(tutorCourses.map((course) => course._id))];
    if (!courseIds.length) return [];
    const studentsResult = await firstValueFrom(
      this.usersClient
        .send<ApiEnvelope<StudentChatProfile[]>>(
          "chat.getEligibleStudentsForTutor",
          { tutorid: profile._id, courseids: courseIds },
        )
        .pipe(timeout(12000)),
    );
    if (!studentsResult?.success || !studentsResult.payload) {
      throw new BadGatewayException("Could not load eligible student profiles.");
    }
    const courseById = new Map(
      tutorCourses.map((course) => [course._id, course]),
    );
    return studentsResult.payload.flatMap((student) => {
      const courses = student.enrolledCourses
        .filter((course) => courseById.has(course.courseid))
        .map((course) => ({
          courseid: course.courseid,
          coursename:
            course.coursename ||
            courseById.get(course.courseid)?.coursename ||
            "",
        }));
      if (!courses.length) return [];
      return [
        {
          contact: {
            userid: student.userid,
            fullname: student.fullname,
            profilepic: student.profilepic,
            role: "student" as const,
            courses: courses.map((course) => ({
              courseid: course.courseid,
              coursename: course.coursename,
            })),
          },
          pair: {
            studentId: student.userid,
            instructorId: profile._id,
            courseIds: courses.map((course) => course.courseid),
          },
        },
      ];
    });
  }

  async findAuthorizedContact(
    profile: SessionProfile,
    participantId: unknown,
  ): Promise<AuthorizedContact> {
    if (typeof participantId !== "string" || !participantId) {
      throw new BadRequestException("A conversation participant is required.");
    }
    const contact = (await this.getAuthorizedContacts(profile)).find(
      (item) => item.contact.userid === participantId,
    );
    if (!contact) {
      throw new ForbiddenException(
        "You are not authorized to message this user.",
      );
    }
    return contact;
  }

  allowDevelopmentEnrollmentsForChat(): boolean {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.ALLOW_UNPAID_ENROLLMENT?.trim().toLowerCase() === "true"
    );
  }

  userRoom(userId: string): string {
    return `user:${userId}`;
  }

  conversationRoom(conversationId: string): string {
    return `conversation:${conversationId}`;
  }

  pairKey(studentId: string, instructorId: string): string {
    return `${studentId}:${instructorId}`;
  }
}
