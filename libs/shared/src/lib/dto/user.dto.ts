import {
  IsDefined,
  IsEmail,
  IsEnum,
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

export class UUpdateUserDto extends GUpdateUserDto{
  @IsOptional()
  @IsString({message:"Profile must be string."})
  profile?:string



  @IsString({message:"token must be string."})
  token!:string


}
