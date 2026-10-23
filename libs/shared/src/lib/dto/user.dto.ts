import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from "class-validator";


export enum UserRole {

  STUDENT = "student",
  TUTOR = 'tutor',
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
}



