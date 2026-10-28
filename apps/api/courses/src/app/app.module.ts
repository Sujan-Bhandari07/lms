import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {DbModule} from "@lms/db"
import{MediaClientModule} from"@lms/medias";
import{RedisModule} from"@lms/redis";
import { Courses, coursesSchema } from './schema/course.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
  imports: [
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
      },  {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.getOrThrow<string>("NOTIFICATION_QUEUE"),
            queueOptions: { durable: true },
          },
        }),
      }
    ]),


     ConfigModule.forRoot({ isGlobal: true }),
      DbModule.forRoot(process.env.MONGO_URI),
      MediaClientModule,
      RedisModule.forRoot({ keyPrefix: "courses:" }),
      DbModule.forFeature([{ name: Courses.name, schema: coursesSchema }]),
      
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
