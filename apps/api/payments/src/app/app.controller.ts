import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePaymentDto } from '@lms/shared';

@Controller()
export class AppController {
  constructor(private readonly paymentsService: AppService) {}
@MessagePattern("createPayment")
createPayment(@Payload() data:CreatePaymentDto){
return this.paymentsService.createPayment(data)
}
 
}
