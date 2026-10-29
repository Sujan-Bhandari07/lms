import {
  BadRequestException,
  BadGatewayException,
  Body,
  Controller,
  ForbiddenException,
  Inject,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import {
  AuthReq,
  CreatePaymentDto,
  InitiatePaymentDto,
  VerifyPaymentDto,
} from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";
import { AuthGuard } from "../guards/auth.guard";

interface SessionProfile {
  _id: string;
  fullname: string;
  email: string;
  role: "student" | "tutor" | "admin";
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  payload?: T;
}

interface CourseRecord {
  _id: string;
  coursename: string;
  price: number;
  isverified: boolean;
  tutor: { tutorid: string; tutorname: string };
}

interface EnrollmentResult {
  courseid: string;
  enrollmentSource: "payment" | "development" | "free";
}

@Controller()
@UseGuards(AuthGuard)
export class PaymentController implements OnModuleInit {
  private readonly logger = new Logger(PaymentController.name);
  private readonly allowUnpaidEnrollment: boolean;

  constructor(
    @Inject("PAYMENTS_SERVICE") private readonly paymentClient: ClientProxy,
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
    @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
    private readonly config: ConfigService,
  ) {
    this.paymentClient = instrumentRmqClient(this.paymentClient, "payments");
    this.usersClient = instrumentRmqClient(this.usersClient, "users");
    this.coursesClient = instrumentRmqClient(this.coursesClient, "courses");
    this.allowUnpaidEnrollment = this.validateUnpaidEnrollmentConfig();
  }

  onModuleInit() {
    this.validateUnpaidEnrollmentConfig();
  }

  @Post("payments/initiate")
  async initiate(@Body() data: InitiatePaymentDto, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    if (!/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(data.transaction_uuid)) {
      throw new BadRequestException("Invalid transaction id.");
    }

    const course = await this.getCourse(data.courseid);
    this.ensurePaidCourse(course);
    return firstValueFrom(
      this.paymentClient
        .send("initiatePayment", this.orderData(course, profile, data.transaction_uuid))
        .pipe(timeout(15000)),
    );
  }

  @Post("payments/verify")
  async verify(@Body() data: VerifyPaymentDto, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    if (!data.data?.trim()) throw new BadRequestException("Payment response is required.");

    let payment: {
      courseid: string;
      transaction_uuid: string;
      status: "success" | "pending" | "failed";
    };
    let developmentBypass = false;
    try {
      const verification = await firstValueFrom(
        this.paymentClient
          .send<ApiEnvelope<{ courseid: string; transaction_uuid: string; status: string }>>(
            "verifyPayment",
            { data: data.data, studentid: profile._id },
          )
          .pipe(timeout(20000)),
      );
      if (
        !verification?.success ||
        !verification.payload ||
        verification.payload.status !== "success"
      ) {
        throw new BadRequestException(
          verification?.message ?? "Payment could not be verified.",
        );
      }
      payment = { ...verification.payload, status: "success" };
    } catch (verificationError) {
      const attempt = await firstValueFrom(
        this.paymentClient
          .send<
            ApiEnvelope<{
              courseid: string;
              transaction_uuid: string;
              status: "success" | "pending" | "failed";
            }>
          >("getPaymentAttempt", { data: data.data, studentid: profile._id })
          .pipe(timeout(10000)),
      );
      if (!attempt?.success || !attempt.payload) {
        throw new BadRequestException(
          attempt?.message ?? "The payment attempt could not be validated.",
        );
      }
      payment = attempt.payload;
      if (payment.status !== "success") {
        if (!this.allowUnpaidEnrollment) throw verificationError;
        developmentBypass = true;
      }
    }

    const enrollment = await firstValueFrom(
      this.usersClient
        .send<ApiEnvelope<EnrollmentResult>>("enrollcourse", {
          studentid: profile._id,
          courseid: payment.courseid,
          paymentVerified: payment.status === "success",
          ...(developmentBypass && { developmentBypass: true }),
        })
        .pipe(timeout(15000)),
    );
    if (!enrollment?.success || !enrollment.payload) {
      this.logger.error(
        `Payment enrollment failed transaction_uuid=${payment.transaction_uuid} courseid=${payment.courseid} message=${enrollment?.message ?? "no response message"}`,
      );
      throw new BadGatewayException(
        enrollment?.message ?? "The payment was processed, but course enrollment could not be completed. Retry verification.",
      );
    }

    if (developmentBypass) {
      this.logger.warn(
        `Development enrollment granted after eSewa verification failed transaction_uuid=${payment.transaction_uuid} courseid=${payment.courseid} payment_status=${payment.status}`,
      );
    } else {
      this.logger.log(
        `Payment verified and enrollment confirmed transaction_uuid=${payment.transaction_uuid} courseid=${payment.courseid}`,
      );
    }

    return {
      success: true,
      message: developmentBypass
        ? "Development enrollment granted; eSewa payment was not verified."
        : "Payment verified and course enrollment completed.",
      payload: {
        courseid: payment.courseid,
        transaction_uuid: payment.transaction_uuid,
        status: "success",
        enrollmentSource: enrollment.payload.enrollmentSource,
        paymentStatus: payment.status,
      },
    };
  }

  @Post("createPayment")
  async createPayment(@Body() data: CreatePaymentDto, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    const course = await this.getCourse(data.courseid);
    this.ensurePaidCourse(course);
    return firstValueFrom(
      this.paymentClient
        .send("createPayment", this.orderData(course, profile, data.transaction_uuid))
        .pipe(timeout(15000)),
    );
  }

  private async getCourse(courseid: string) {
    const result = await firstValueFrom(
      this.coursesClient
        .send<ApiEnvelope<CourseRecord>>("getcoursebyid", { courseid })
        .pipe(timeout(10000)),
    );
    if (!result?.success || !result.payload) {
      throw new BadRequestException("The selected course could not be found.");
    }
    return result.payload;
  }

  private ensurePaidCourse(course: CourseRecord) {
    if (!course.isverified) {
      throw new BadRequestException("This course is not available for enrollment.");
    }
    if (!Number.isFinite(course.price) || course.price <= 0) {
      throw new BadRequestException("This course does not require a payment.");
    }
  }

  private orderData(
    course: CourseRecord,
    profile: SessionProfile,
    transaction_uuid: string,
  ) {
    return {
      transaction_uuid,
      courseid: course._id,
      amount: Math.round(course.price * 100) / 100,
      sender: { userid: profile._id, username: profile.fullname },
      receiver: {
        userid: course.tutor.tutorid,
        username: course.tutor.tutorname,
      },
    };
  }

  private async sessionProfile(token: string): Promise<SessionProfile> {
    const result = await firstValueFrom(
      this.usersClient
        .send<ApiEnvelope<SessionProfile>>("getprofile", { token })
        .pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload) {
      throw new UnauthorizedException("Your session is no longer valid.");
    }
    return result.payload;
  }

  private requireStudent(profile: SessionProfile) {
    if (profile.role !== "student") {
      throw new ForbiddenException("A student account is required.");
    }
  }

  private validateUnpaidEnrollmentConfig() {
    const setting = this.config
      .get<string>("ALLOW_UNPAID_ENROLLMENT")
      ?.trim()
      .toLowerCase();
    if (!setting || setting === "false") return false;
    if (setting !== "true") {
      throw new InternalServerErrorException(
        "ALLOW_UNPAID_ENROLLMENT must be set to true or false.",
      );
    }
    if (this.config.get<string>("NODE_ENV") !== "development") {
      throw new InternalServerErrorException(
        "ALLOW_UNPAID_ENROLLMENT=true is only permitted when NODE_ENV=development.",
      );
    }
    return true;
  }
}
