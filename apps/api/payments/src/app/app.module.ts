import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "@lms/db";
import { Payments, paymentSchema } from "./schema/payment.schema";
import { resolve } from "node:path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(process.cwd(), "apps/api/payments/.env"), ".env"],
    }),
    DbModule.forRoot(process.env.MONGO_URI),
    DbModule.forFeature([{ name: Payments.name, schema: paymentSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
