import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UsersController } from "./controllers/user.controller";
import { CourseController } from "./controllers/course.controller";
import { PaymentController } from "./controllers/payment.controller";
import { CourseCatalogController } from "./controllers/course-catalog.controller";
import { LearningController } from "./controllers/learning.controller";
import { AdminController } from "./controllers/admin.controller";
import { ChatController } from "./controllers/chat.controller";
import { AiController } from "./controllers/ai.controller";
import { ChatAuthService } from "./services/chat-auth.service";
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
        name: "AGENTS_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>("RABBITMQ_URL")],
            queue: config.getOrThrow<string>("AGENTS_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },

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
    CourseCatalogController,
    LearningController,
    AdminController,
    ChatController,
    AiController,
  ],
  providers: [
    AppService,
    ChatAuthService,
    ChatGateway,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
