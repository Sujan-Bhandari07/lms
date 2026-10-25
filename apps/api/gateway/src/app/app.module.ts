import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config"
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './controllers/user.controller';
import { CourseController } from './controllers/course.controller';

@Module({
  imports: [
     ConfigModule.forRoot({ isGlobal: true }),
     ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.getOrThrow<string>("USERS_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'COURSES_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.getOrThrow<string>("COURSES_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'PAYMENTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.getOrThrow<string>("PAYMENTS_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      },
     
    ]),

  ],
  controllers: [AppController,UsersController,CourseController],
  providers: [AppService],
})
export class AppModule {}
