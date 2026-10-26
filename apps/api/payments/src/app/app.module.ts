import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "@lms/db";
import { Payments, paymentSchema } from "./schema/payment.schema";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule.forRoot(process.env.MONGO_URI),
    DbModule.forFeature([{ name: Payments.name, schema: paymentSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
