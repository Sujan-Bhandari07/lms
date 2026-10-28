import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class SignUpEmailDto {
  @IsString({ message: "Fullname must be string ." })
  @IsNotEmpty({ message: "Fullname cannot be empty." })
  @IsDefined({ message: "Fullname is required" })
  fullname!: string;
  @IsString({ message: "Role must be string ." })
  @IsNotEmpty({ message: "Role cannot be empty." })
  @IsDefined({ message: "Role is required" })
  role!: string;
  @IsString({ message: "Email must be string ." })
  @IsNotEmpty({ message: "Email cannot be empty." })
  @IsDefined({ message: "Email is required" })
  email!: string;
}

export class TutorVerifiedEmailDto {
  @IsString({ message: "Fullname must be string ." })
  @IsNotEmpty({ message: "Fullname cannot be empty." })
  @IsDefined({ message: "Fullname is required" })
  fullname!: string;

  @IsString({ message: "Email must be string ." })
  @IsNotEmpty({ message: "Email cannot be empty." })
  @IsDefined({ message: "Email is required" })
  email!: string;
}

export class TutorCourseVerifiedEmailDto {
  @IsString({ message: "Fullname must be string ." })
  @IsNotEmpty({ message: "Fullname cannot be empty." })
  @IsDefined({ message: "Fullname is required" })
  fullname!: string;
  @IsString({ message: "Coursename must be string ." })
  @IsNotEmpty({ message: "Coursename cannot be empty." })
  @IsDefined({ message: "Coursename is required" })
  coursename!: string;
  @IsString({ message: "Email must be string ." })
  @IsNotEmpty({ message: "Email cannot be empty." })
  @IsDefined({ message: "Email is required" })
  email!: string;
}

export class CourseEnrolledEmailDto extends TutorCourseVerifiedEmailDto{
      @IsString({ message: "Tutorname must be string ." })
  @IsNotEmpty({ message: "Tutorname cannot be empty." })
  @IsDefined({ message: "Tutorname is required" })
    tutorname!:string

}

export class CourseCertificateEmailDto extends TutorCourseVerifiedEmailDto{}




