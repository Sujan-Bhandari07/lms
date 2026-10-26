/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {Transport,MicroserviceOptions} from "@nestjs/microservices"
import { AppModule } from './app/app.module';
import {ServiceExceptionFilter} from "@lms/filters"


async function bootstrap() {
  process.title="Chat service"
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: process.env.CHAT_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(new ServiceExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    transform:true,
    forbidNonWhitelisted:true

  }))
  await app.listen();
  Logger.log("Chat service started");
}

bootstrap();
