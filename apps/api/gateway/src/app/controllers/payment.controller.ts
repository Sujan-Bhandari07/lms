import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class PaymentController {
    constructor(@Inject("PAYMENTS_SERVICE") private readonly paymentClient:ClientProxy){}
  

 
}
