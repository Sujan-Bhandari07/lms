import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payments, PaymentsDocument } from './schema/payment.schema';

@Injectable()
export class AppService {

  constructor(@InjectModel(Payments.name) private readonly paymentmodel:Model<PaymentsDocument>){}
  
}
