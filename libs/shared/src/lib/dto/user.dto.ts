import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";


export enum UserRole {
  STUDENT = "student",
  TUTOR = "tutor",
}

export class RegisterDto {
  @IsString({ message: "Fullname must be string ." })
  @IsNotEmpty({ message: "Fullname cannot be empty." })
  @IsDefined({ message: "Fullname is required" })
  fullname!: string;

  @IsEmail({}, { message: "Pls provide email in valid format" })
  @IsNotEmpty({ message: "Email cant be empty." })
  @IsDefined({ message: "Emai is required" })
  email!: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 2,
    minUppercase: 1,
    minNumbers: 2,
    minSymbols: 1,
  })
  @IsDefined({ message: "Password is required." })
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  profilepic?: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Pls provide email in valid format" })
  @IsNotEmpty({ message: "Email cant be empty." })
  @IsDefined({ message: "Emai is required" })
  email!: string;

  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 2,
      minUppercase: 1,
      minNumbers: 2,
      minSymbols: 1,
    },
    { message: "Pls provide strong password." },
  )
  @IsDefined({ message: "Password is required." })
  password!: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class GUpdateUserDto {
  @IsString({ message: "Fullname must be string ." })
  @IsNotEmpty({ message: "Fullname cannot be empty." })
  @IsOptional()
  fullname?: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 2,
    minUppercase: 1,
    minNumbers: 2,
    minSymbols: 1,
  })
  @IsOptional()
  password?: string;
}

export class UUpdateUserDto extends GUpdateUserDto {
  @IsOptional()
  @IsString({ message: "Profile must be string." })
  profile?: string;

  @IsString({ message: "token must be string." })
  token!: string;
}

export class GCreateCerticateDto {
  @IsString({ message: "Coursename must be string ." })
  @IsNotEmpty({ message: "Coursename cannot be empty." })
  @IsDefined({ message: "Coursename is required" })
  coursename!: string;

  @IsMongoId()
  @IsNotEmpty({ message: "Tutor cannot be empty." })
  @IsDefined({ message: "Tutor is required" })
  tutor!: string;

  @IsMongoId()
  @IsNotEmpty({ message: "Course id  cannot be empty." })
  @IsDefined({ message: "Course id  is required" })
  courseid!: string;
}
export class GUpdateEnrolledCourseDto extends GCreateCerticateDto {}

export class UCreateCerticateDto extends GCreateCerticateDto {
  @IsMongoId()
  @IsNotEmpty({ message: "Student id  cannot be empty." })
  @IsDefined({ message: "Student id  is required" })
  studentid!: string;
}
export class UUpdateEnrolledCourseDto extends GUpdateEnrolledCourseDto {

   @IsMongoId()
  @IsNotEmpty({ message: "Student id  cannot be empty." })
  @IsDefined({ message: "Student id  is required" })
  studentid!: string;
}

export class GUpdateTutorDto {
  @IsString({ message: "Academics of Tutor  must be string ." })
  @IsNotEmpty({ message: "Academics of Tutor  cannot be empty." })
  @IsDefined({ message: "Academics of Tutor  is required" })
  acedemics!: string;

  @IsString({ message: "Experience of tutor must be string ." })
  @IsNotEmpty({ message: "Experience of tutor cannot be empty." })
  @IsDefined({ message: "Experience of tutor is required" })
  experience!: string;
}

export class UUpdateTutorDto extends GUpdateTutorDto {
  @IsMongoId()
  @IsNotEmpty({ message: "User id  cannot be empty." })
  @IsDefined({ message: "User id  is required" })
  userid!: string;
}

export class VerifyTutorDto {
  @IsMongoId()
  @IsNotEmpty({ message: "User id  cannot be empty." })
  @IsDefined({ message: "User id  is required" })
  userid!: string;

  @IsOptional()
  @IsIn(["approve", "reject"])
  decision?: "approve" | "reject";
}



export class GMakeCourseCompletedDto {
  @IsMongoId()
  @IsNotEmpty({ message: "Course id  cannot be empty." })
  @IsDefined({ message: "Course id  is required" })
  courseid!: string;
}

export class UMakeCourseCompletedDto extends GMakeCourseCompletedDto {
  @IsMongoId()
  @IsNotEmpty({ message: "Student id  cannot be empty." })
  @IsDefined({ message: "Student id  is required" })
  studentid!: string;
}

export class GetAllTutorsDto{
@IsString({ message: "Student id  must be string ." })
  @IsNotEmpty({ message: "Student id  cannot be empty." })
  @IsDefined({ message: "Student id  is required" })
  studentid!:string
}

export class GetUserNotificationDto {
  @IsString({ message: "User id  must be string ." })
  @IsNotEmpty({ message: "User id  cannot be empty." })
  @IsDefined({ message: "User id  is required" })
  userid!:string
}

export class EnrollCourseDto {
  @IsMongoId()
  @IsDefined()
  courseid!: string;
}

export class UpdateTutorProfileDto {
  @IsString()
  @IsNotEmpty()
  acedemics!: string;

  @IsString()
  @IsNotEmpty()
  experience!: string;
}
