import { describe, expect, it, vi } from "vitest";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { of } from "rxjs";
import { ChatAuthService, SessionProfile } from "./chat-auth.service";

describe("ChatAuthService", () => {
  const createMockUsersClient = (responses: Record<string, unknown> = {}) => ({
    send: vi.fn((pattern: string, data: unknown) => {
      if (responses[pattern]) {
        return of(responses[pattern]);
      }
      return of({ success: false, message: "Not configured" });
    }),
  });

  const createMockCoursesClient = (responses: Record<string, unknown> = {}) => ({
    send: vi.fn((pattern: string, data: unknown) => {
      if (responses[pattern]) {
        return of(responses[pattern]);
      }
      return of({ success: false, message: "Not configured" });
    }),
  });

  it("should reject session verification when token is missing", async () => {
    const service = new ChatAuthService(
      createMockUsersClient() as any,
      createMockCoursesClient() as any,
    );
    await expect(service.sessionProfile("")).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should return empty authorized contacts for a student not enrolled in any course", async () => {
    const usersClient = createMockUsersClient({
      getenrolledcourses: { success: true, payload: [] },
    });
    const service = new ChatAuthService(
      usersClient as any,
      createMockCoursesClient() as any,
    );

    const studentProfile: SessionProfile = {
      _id: "student123",
      fullname: "John Student",
      email: "student@example.com",
      role: "student",
      profilepic: "",
    };

    const contacts = await service.getAuthorizedContacts(studentProfile);
    expect(contacts).toEqual([]);

    await expect(
      service.findAuthorizedContact(studentProfile, "tutor999"),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should authorize conversation when student is enrolled in tutor course", async () => {
    const usersClient = createMockUsersClient({
      getenrolledcourses: {
        success: true,
        payload: [
          {
            _id: "course1",
            coursename: "NestJS Mastery",
            tutor: { tutorid: "tutor1", tutorname: "Jane Tutor", profilepic: "pic.jpg" },
          },
        ],
      },
    });
    const service = new ChatAuthService(
      usersClient as any,
      createMockCoursesClient() as any,
    );

    const studentProfile: SessionProfile = {
      _id: "student1",
      fullname: "John Student",
      email: "student@example.com",
      role: "student",
      profilepic: "",
    };

    const contacts = await service.getAuthorizedContacts(studentProfile);
    expect(contacts.length).toBe(1);
    expect(contacts[0].contact.userid).toBe("tutor1");
    expect(contacts[0].pair).toEqual({
      studentId: "student1",
      instructorId: "tutor1",
      courseIds: ["course1"],
    });

    const authorized = await service.findAuthorizedContact(studentProfile, "tutor1");
    expect(authorized.contact.fullname).toBe("Jane Tutor");
  });

  it("should group multiple courses from the same tutor into a single conversation without duplicates", async () => {
    const usersClient = createMockUsersClient({
      getenrolledcourses: {
        success: true,
        payload: [
          {
            _id: "course1",
            coursename: "NestJS Mastery",
            tutor: { tutorid: "tutor1", tutorname: "Jane Tutor" },
          },
          {
            _id: "course2",
            coursename: "Advanced TypeScript",
            tutor: { tutorid: "tutor1", tutorname: "Jane Tutor" },
          },
        ],
      },
    });
    const service = new ChatAuthService(
      usersClient as any,
      createMockCoursesClient() as any,
    );

    const studentProfile: SessionProfile = {
      _id: "student1",
      fullname: "John Student",
      email: "student@example.com",
      role: "student",
      profilepic: "",
    };

    const contacts = await service.getAuthorizedContacts(studentProfile);
    expect(contacts.length).toBe(1);
    expect(contacts[0].pair.courseIds).toEqual(["course1", "course2"]);
    expect(contacts[0].contact.courses.length).toBe(2);
  });

  it("should allow separate conversations when enrolled in courses from different tutors", async () => {
    const usersClient = createMockUsersClient({
      getenrolledcourses: {
        success: true,
        payload: [
          {
            _id: "course1",
            coursename: "NestJS Mastery",
            tutor: { tutorid: "tutor1", tutorname: "Jane Tutor" },
          },
          {
            _id: "course3",
            coursename: "Python for AI",
            tutor: { tutorid: "tutor2", tutorname: "Bob Tutor" },
          },
        ],
      },
    });
    const service = new ChatAuthService(
      usersClient as any,
      createMockCoursesClient() as any,
    );

    const studentProfile: SessionProfile = {
      _id: "student1",
      fullname: "John Student",
      email: "student@example.com",
      role: "student",
      profilepic: "",
    };

    const contacts = await service.getAuthorizedContacts(studentProfile);
    expect(contacts.length).toBe(2);
    expect(contacts.map((c) => c.contact.userid)).toEqual(["tutor1", "tutor2"]);
  });

  it("should allow tutors to message only students enrolled in their verified courses", async () => {
    const coursesClient = createMockCoursesClient({
      "chat.getTutorCourses": {
        success: true,
        payload: [
          {
            _id: "course1",
            coursename: "NestJS Mastery",
            isverified: true,
            tutor: { tutorid: "tutor1", tutorname: "Jane Tutor" },
          },
        ],
      },
    });

    const usersClient = createMockUsersClient({
      "chat.getEligibleStudentsForTutor": {
        success: true,
        payload: [
          {
            userid: "student1",
            fullname: "John Student",
            profilepic: "",
            enrolledCourses: [{ courseid: "course1", coursename: "NestJS Mastery" }],
          },
        ],
      },
    });

    const service = new ChatAuthService(
      usersClient as any,
      coursesClient as any,
    );

    const tutorProfile: SessionProfile = {
      _id: "tutor1",
      fullname: "Jane Tutor",
      email: "tutor@example.com",
      role: "tutor",
      profilepic: "",
    };

    const contacts = await service.getAuthorizedContacts(tutorProfile);
    expect(contacts.length).toBe(1);
    expect(contacts[0].contact.userid).toBe("student1");
    expect(contacts[0].pair).toEqual({
      studentId: "student1",
      instructorId: "tutor1",
      courseIds: ["course1"],
    });

    // Unrelated student is forbidden
    await expect(
      service.findAuthorizedContact(tutorProfile, "unrelatedStudent"),
    ).rejects.toThrow(ForbiddenException);
  });
});

