import { Injectable } from "@nestjs/common";
import {
  ICourseCertificate,
  ICourseEnrolled,
  ISignupEmail,
  IVerifiedCourse,
  IVerifiedTutor,
} from "@lms/shared";
import nodemailer from "nodemailer";
import {
  STUDENT_SIGNUP_EMAIL,
  TUTOR_SIGNUP_EMAIL,
} from "./Emails/signup.email";
import { TUTOR_COURSE_VERIFIED_EMAIL } from "./Emails/tutor.course.verified";
import { TUTOR_VERIFIED_EMAIL } from "./Emails/tutor.verified";
import { COURSE_ENROLLED_EMAIL } from "./Emails/course.enrolled.email";
import { COURSE_CERTIFICATE_EMAIL } from "./Emails/course.certificate";

@Injectable()
export class AppService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_KEY, // Use App Password for Gmail
    },
  });

  async signupemail(data: ISignupEmail) {
    let template;
    if (data.role === "student") {
      template = STUDENT_SIGNUP_EMAIL(data.fullname, data.email);
      await this.transporter.sendMail(template);
    } else {
      template = TUTOR_SIGNUP_EMAIL(data.fullname, data.email);
      await this.transporter.sendMail(template);
    }
  }

  async courseverifiedemail(data: IVerifiedCourse) {
    const mailoption = TUTOR_COURSE_VERIFIED_EMAIL(
      data.fullname,
      data.coursename,
      data.email,
    );
    await this.transporter.sendMail(mailoption);
  }

  async tutorverifiedemail(data: IVerifiedTutor) {
    const mailoption = TUTOR_VERIFIED_EMAIL(data.fullname, data.email);
    await this.transporter.sendMail(mailoption);
  }

  async enrolledcourseemail(data: ICourseEnrolled) {
    const mailoption = COURSE_ENROLLED_EMAIL(
      data.fullname,
      data.coursename,
      data.email,
      data.tutorname,
    );
    await this.transporter.sendMail(mailoption);
  }

  async coursecertificateemail(data: ICourseCertificate) {
    const mailoption = COURSE_CERTIFICATE_EMAIL(
      data.fullname,
      data.coursename,
      data.email,
    );
    await this.transporter.sendMail(mailoption);
  }
}
