import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class AiSendMessageDto {
  @IsString()
  @IsNotEmpty({ message: "Enter a message." })
  @MaxLength(8000, { message: "Messages must contain at most 8000 characters." })
  text!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
