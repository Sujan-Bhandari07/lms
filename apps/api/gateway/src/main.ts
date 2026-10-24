/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from "cookie-parser"
import {GatewayExceptionFilter} from "@lms/filters"

async function bootstrap() {
  process.title="Gateway"
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.GATEWAY_PORT
  app.useGlobalFilters(new GatewayExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    transform:true,
    forbidNonWhitelisted:true

  }))
    app.use(cookieParser());
  await app.listen(port);
  Logger.log(`🚀 Gateway is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
