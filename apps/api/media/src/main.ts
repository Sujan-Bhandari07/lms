/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MEDIA_QUEUE } from "@lms/medias"
import { RmqDiagnosticsInterceptor, ServiceExceptionFilter } from "@lms/filters"
async function bootstrap() {
  process.title="Media service"
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue:MEDIA_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(new ServiceExceptionFilter())
  app.useGlobalInterceptors(new RmqDiagnosticsInterceptor("media"))
  await app.listen();
  Logger.log("Media service started");
}

bootstrap();
