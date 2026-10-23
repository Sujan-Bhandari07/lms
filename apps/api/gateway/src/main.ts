/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';


async function bootstrap() {
  process.title="Gateway"
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.GATEWAY_PORT;
  await app.listen(port);
  Logger.log(`🚀 Gateway is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
