import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class TutorDto {
  @IsString({ message: "Tutor's name must be a string." })
  @IsDefined({ message: "Tutor's name is required" })
  @IsNotEmpty({ message: "Tutor's name cant be empty." })
  tutorname!: string;

  @IsString({ message: "Tutor's id must be a string." })
  @IsDefined({ message: "Tutor's id is required" })
  @IsNotEmpty({ message: "Tutor's id cant be empty." })
  tutorid!: string;
}

export class CreateCourseDto {
  @IsString({ message: "Coursename must be a string." })
  @IsDefined({ message: "Coursename is required" })
  @IsNotEmpty({ message: "Coursename cant be empty." })
  coursename!: string;

  @IsString({ message: "Title must be a string." })
  @IsDefined({ message: "Title is required" })
  @IsNotEmpty({ message: "Title cant be empty." })
  title!: string;

  @IsString({ message: "Description of course must be a string." })
  @IsDefined({ message: "Description of course is required" })
  @IsNotEmpty({ message: "Description of course cant be empty." })
  desc!: string;

  @IsString({ message: "Techstack  must be a string." })
  @IsDefined({ message: "Techstack  is required" })
  @IsNotEmpty({ message: "Techstack  cant be empty." })
  techstack!: string;

  @ValidateNested()
  @Type(() => TutorDto)
  tutor!: TutorDto;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    { message: "Price of course must be a Number." },
  )
  @IsDefined({ message: "Price of course is required" })
  @Min(0, { message: "Price of course must be greater than 0." })
  price!: number;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    { message: "Discount of course must be a Number." },
  )
  @IsOptional()
  @Min(0, { message: "Discount of course must be greater than 0." })
  discount?: number;
}

export class VerifyCourseDto {
  @IsBoolean()
  @IsDefined()
  verify!: boolean;
  @IsString({ message: "Course id must be a string." })
  @IsDefined({ message: "Course id is required" })
  @IsNotEmpty({ message: "Course id cant be empty." })
  courseid!: string;
}

export class ProvideRatingDto {
  @IsString({ message: "Student name must be a string." })
  @IsDefined({ message: "Student name is required" })
  @IsNotEmpty({ message: "Student name cant be empty." })
  studentname!: string;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    { message: "Rating of course must be a Number." },
  )
  @IsDefined({ message: "Rating of course is required" })
  @Min(0, { message: "Rating of course must be greater than 0." })
  rating!: number;

  @IsString({ message: "Course id must be a string." })
  @IsDefined({ message: "Course id is required" })
  @IsNotEmpty({ message: "Course id cant be empty." })
  courseid!: string;
}

export class SendCommentDto {
  @IsString({ message: "Comment must be a string." })
  @IsDefined({ message: "Comment is required" })
  @IsNotEmpty({ message: "Comment cant be empty." })
  comment!: string;

  @IsString({ message: "Course id must be a string." })
  @IsDefined({ message: "Course id is required" })
  @IsNotEmpty({ message: "Course id cant be empty." })
  courseid!: string;

  @IsString({ message: "Student name must be a string." })
  @IsDefined({ message: "Student name is required" })
  @IsNotEmpty({ message: "Student name cant be empty." })
  studentname!: string;
}

export class GUploadPartDto {
  @IsString({ message: "Course id must be a string." })
  @IsDefined({ message: "Course id is required" })
  @IsNotEmpty({ message: "Course id cant be empty." })
  courseid!: string;

  @IsString({ message: "Part title must be a string." })
  @IsDefined({ message: "Part title is required" })
  @IsNotEmpty({ message: "Part title cant be empty." })
  title!: string;

  @IsString({ message: "Part Description must be a string." })
  @IsDefined({ message: "Part Description is required" })
  @IsNotEmpty({ message: "Part Description cant be empty." })
  partdesc!: string;
}

export class CUploadPartDto extends GUploadPartDto {
  @IsString({ message: "Tutor id must be a string." })
  @IsDefined({ message: "Video Url is required" })
  @IsNotEmpty({ message: "Video Url cant be empty." })
  videourl!: string;
}

export class GetCourseTutorDto {
  @IsString({ message: "Tutor id must be a string." })
  @IsDefined({ message: "Tutor id is required" })
  @IsNotEmpty({ message: "Tutor id cant be empty." })
  tutorid!: string;

  @IsString({ message: "Tutor name must be a string." })
  @IsDefined({ message: "Tutor name is required" })
  @IsNotEmpty({ message: "Tutor name cant be empty." })
  tutorname!: string;
}

export class UserCourseDto {
  @IsString({ message: "User id  must be string ." })
  @IsNotEmpty({ message: "User id  cannot be empty." })
  @IsDefined({ message: "User id  is required" })
  userid!: string;
  @IsString({ message: "User name  must be string ." })
  @IsNotEmpty({ message: "User name  cannot be empty." })
  @IsDefined({ message: "User name  is required" })
  username!: string;

  @IsString({ message: "Course id  must be string ." })
  @IsNotEmpty({ message: "Course id  cannot be empty." })
  @IsDefined({ message: "Course id  is required" })
  courseid!: string;
}

export class CouseCompletionDto {
  @IsString({ message: "Course id  must be string ." })
  @IsNotEmpty({ message: "Course id  cannot be empty." })
  @IsDefined({ message: "Course id  is required" })
  courseid!: string;
}

enum Role {
  STUDENT = "student",
  TUTOR = "tutor",
}

export class GetAllStudentsDto {
  @IsString({ message: "Tutor id must be a string." })
  @IsDefined({ message: "Tutor id is required" })
  @IsNotEmpty({ message: "Tutor id cant be empty." })
  tutorid!: string;
}

export class UpdateStudentInCourseDto {
  @IsString({ message: "User's name   must be string ." })
  @IsNotEmpty({ message: "User's name   cannot be empty." })
  @IsDefined({ message: "User's name   is required" })
  username!: string;

  @IsString({ message: "User id  must be string ." })
  @IsNotEmpty({ message: "User id  cannot be empty." })
  @IsDefined({ message: "User id  is required" })
  userid!: string;

  @IsEnum(Role)
  @IsDefined({ message: "User id  is required" })
  role!: Role;
}
