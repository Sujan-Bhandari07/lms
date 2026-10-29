/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import{Transport,MicroserviceOptions} from "@nestjs/microservices"
import { RmqDiagnosticsInterceptor, ServiceExceptionFilter } from "@lms/filters"

async function bootstrap() {
  process.title="Notification service"
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue:process.env.NOTIFICATION_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(new ServiceExceptionFilter())
  app.useGlobalInterceptors(new RmqDiagnosticsInterceptor("notifications"))
  await app.listen();
  Logger.log("Notification service started");
}

bootstrap();
