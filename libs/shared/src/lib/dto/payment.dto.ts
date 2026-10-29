import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsString,
  Min,
  IsUUID,
  ValidateNested,
} from "class-validator";


export class CreateTransactorsDto{
   @IsString({ message: "Username must be string ." })
  @IsNotEmpty({ message: "Username cannot be empty." })
  @IsDefined({ message: "Username is required" })
  username!: string;


   @IsString({ message: "User's id  must be string ." })
  @IsNotEmpty({ message: "User's id cannot be empty." })
  @IsDefined({ message: "User's id is required" })
  userid!: string;
}

export class CreateSignatureDto {
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: "The amount of transaction should ne in number." },
  )
  @Min(0)
  @IsDefined({ message: "The transaction amount is required." })
  total_amount!: number;

  @IsString({ message: "Transaction_uuid must be string ." })
  @IsNotEmpty({ message: "Transaction_uuid cannot be empty." })
  @IsDefined({ message: "Transaction_uuid is required" })
  transaction_uuid!: string;

  @IsString({ message: "Product_code must be string ." })
  @IsNotEmpty({ message: "Product_code cannot be empty." })
  @IsDefined({ message: "Product_code is required" })
  product_code!: string;
}


export class CreatePaymentDto{
    @IsString({ message: "Transaction_uuid must be string ." })
  @IsNotEmpty({ message: "Transaction_uuid cannot be empty." })
  @IsDefined({ message: "Transaction_uuid is required" })
  transaction_uuid!: string;


    @IsString({ message: "Course id must be string ." })
  @IsNotEmpty({ message: "Course id cannot be empty." })
  @IsDefined({ message: "Course id is required" })
  courseid!: string;

@ValidateNested()
@Type(()=>CreateTransactorsDto)
sender!:CreateTransactorsDto


@ValidateNested()
@Type(()=>CreateTransactorsDto)
receiver!:CreateTransactorsDto

  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: "The amount of transaction should ne in number." },
  )
  @Min(0)
  @IsDefined({ message: "The transaction amount is required." })
  amount!: number;



}

export class InitiatePaymentDto {
  @IsMongoId()
  courseid!: string;

  @IsUUID()
  transaction_uuid!: string;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  data!: string;
}

export class GetPublicUserProfilesDto {
  @IsArray()
  @IsMongoId({ each: true })
  userids!: string[];
}






