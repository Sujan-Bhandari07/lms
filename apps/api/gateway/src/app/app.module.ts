import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UsersController } from "./controllers/user.controller";
import { CourseController } from "./controllers/course.controller";
import { PaymentController } from "./controllers/payment.controller";
import { ChatGateway } from "./sockets/chat.gateway";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

     ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          ttl: 60_000,
          limit: 100,
        },
      ],
      storage: new ThrottlerStorageRedisService(
        process.env.REDIS_URL || "redis://localhost:6379",
      ),
    }),
    ClientsModule.registerAsync([
      {
        name: "USERS_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>("RABBITMQ_URL")],
            queue: config.getOrThrow<string>("USERS_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: "COURSES_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>("RABBITMQ_URL")],
            queue: config.getOrThrow<string>("COURSES_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name: "CHAT_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>("RABBITMQ_URL")],
            queue: config.getOrThrow<string>("CHAT_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name: "PAYMENTS_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>("RABBITMQ_URL")],
            queue: config.getOrThrow<string>("PAYMENTS_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    CourseController,
    PaymentController,
  ],
  providers: [AppService, ChatGateway, {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },],
})
export class AppModule {}
