import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePaymentDto, ICreatePayment, VerifyPaymentDto } from '@lms/shared';

@Controller()
export class AppController {
  constructor(private readonly paymentsService: AppService) {}

  @MessagePattern("createPayment")
  createPayment(@Payload() data: CreatePaymentDto) {
    return this.paymentsService.createPayment(data);
  }

  @MessagePattern("initiatePayment")
  initiatePayment(@Payload() data: ICreatePayment) {
    return this.paymentsService.initiatePayment(data);
  }

  @MessagePattern("verifyPayment")
  verifyPayment(@Payload() data: VerifyPaymentDto & { studentid: string }) {
    return this.paymentsService.verifyPayment(data);
  }

  @MessagePattern("getPaymentAttempt")
  getPaymentAttempt(@Payload() data: VerifyPaymentDto & { studentid: string }) {
    return this.paymentsService.getPaymentAttempt(data);
  }

  @MessagePattern("chat.getSuccessfulPurchases")
  getChatPurchases(
    @Payload() data: { userid: string; role: "student" | "tutor" },
  ) {
    return this.paymentsService.getChatPurchases(data);
  }
}
