import { DbModule } from "@lms/db";
import { MediaClientModule } from "@lms/medias";
import { RedisModule } from "@lms/redis";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Students, Studentsschema } from "./schema/studentprofile";
import { Tutors, TutorsSchema } from "./schema/tutorsprofie";
import { Users, Userschema } from "./schema/userschema";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
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
    MediaClientModule,

    EventEmitterModule.forRoot(),
    DbModule.forRoot(process.env.MONGO_URI),
    RedisModule.forRoot({ keyPrefix: "users:" }),
    DbModule.forFeature([{ name: Users.name, schema: Userschema }]),
    DbModule.forFeature([{ name: Tutors.name, schema: TutorsSchema }]),
    DbModule.forFeature([{ name: Students.name, schema: Studentsschema }]),

    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
