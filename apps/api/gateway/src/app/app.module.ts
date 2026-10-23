import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config"
import { ClientsModule, Transport } from '@nestjs/microservices';

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
            queue: 'USERS_QUEUE',
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
            queue: 'COURSES_QUEUE',
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
            queue: 'PAYMENST_QUEUE',
            queueOptions: { durable: true },
          },
        }),
      },
     
    ]),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
