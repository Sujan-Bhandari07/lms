import { CreatePaymentDto } from "@lms/shared";
import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Controller()
export class PaymentController {
  constructor(
    @Inject("PAYMENTS_SERVICE") private readonly paymentClient: ClientProxy,
  ) {}

  @Post("createPayment")
  createPayment(@Body() data: CreatePaymentDto) {
    return firstValueFrom(this.paymentClient.send("createPayment", data));
  }
}
