import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { createHmac } from "node:crypto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payments, PaymentsDocument } from "./schema/payment.schema";
import { ICreatePayment, ICreateSignature, success } from "@lms/shared";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Payments.name)
    private readonly paymentmodel: Model<PaymentsDocument>,
  ) {}
  private readonly config: ConfigService;

  async createSignature(data: ICreateSignature) {
    const { transaction_uuid, product_code, total_amount } = data;
    const hash = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const sign = createHmac(
      "sha256",
      this.config.getOrThrow<string>("ESEWA_SECRET"),
    )
      .update(hash)
      .digest("base64");
    if (!sign) throw new BadRequestException("cannot create a signature.");
    return success("Signature created", sign);
  }

  async verifyPatment(data: ICreateSignature) {
    const { total_amount, transaction_uuid, product_code } = data;
    const query = new URLSearchParams({
      product_code,
      total_amount: String(total_amount),
      transaction_uuid,
    });
    const response = await fetch(
      `https://rc.esewa.com.np/api/epay/transaction/status/?${query}`,
    );
    console.log("verify payment",response)

    if (!response.ok) {
      throw new BadGatewayException(
        `eSewa verification request failed (${response.status}).`,
      );
    }

    const result = (await response.json()) as {
      status?: string;
      [key: string]: unknown;
    };
    const status = result.status?.trim().toLowerCase();

    if (status === "complete") {
      return {
        success: true,
        result,
      };
    }

    throw new BadRequestException(
      `Payment is not complete (eSewa status: ${result.status ?? "unknown"}).`,
    );
  }


  async createPayment(data:ICreatePayment){
    const{transaction_uuid,amount,sender,receiver,courseid} =data
    const payment= await this.paymentmodel.create({
      amount,courseid,transaction_uuid,sender,receiver
    })
    if(!payment){
      throw new InternalServerErrorException("Something went wrong with db")
    }

    return success("Payment created successfully",payment)
    
  }
}
