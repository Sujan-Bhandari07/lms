import { Type } from "class-transformer";
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";
export class User {
  @IsString({ message: "User id must be string ." })
  @IsNotEmpty({ message: "User id cannot be empty." })
  @IsDefined({ message: "User id   is required" })
  userid!: string;

  @IsString({ message: "User name must be string ." })
  @IsNotEmpty({ message: "User name cannot be empty." })
  @IsDefined({ message: "User name   is required" })
  username!: string;
}

export class SendMessageDto {
  @IsString({ message: "Message must be string ." })
  @IsNotEmpty({ message: "Message cannot be empty." })
  @IsDefined({ message: "Message   is required" })
  message!: string;


  @ValidateNested()
  @Type(() => User)
  sender!: User;

  @ValidateNested()
  @Type(() => User)
  receiver!: User;
}

export class GetConversationDto{

    @IsString({ message: "Sender must be string ." })
  @IsNotEmpty({ message: "Sender cannot be empty." })
  @IsDefined({ message: "Sender   is required" })
    sender!:string

    @IsString({ message: "Receiver must be string ." })
  @IsNotEmpty({ message: "Receiver cannot be empty." })
  @IsDefined({ message: "Receiver   is required" })
    receiver!:string
}

export class ChatParticipantDto {
  @IsString({ message: "Participant id must be a string." })
  @IsNotEmpty({ message: "A conversation participant is required." })
  @IsDefined({ message: "A conversation participant is required." })
  participantId!: string;
}

export class ChatHistoryQueryDto {
  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class ChatSendHttpDto {
  @IsString({ message: "Message must be a string." })
  @IsNotEmpty({ message: "Message cannot be empty." })
  @MaxLength(4000, { message: "Messages must contain at most 4000 characters." })
  text!: string;

  @IsUUID("4", { message: "Invalid message id." })
  clientMessageId!: string;
}


