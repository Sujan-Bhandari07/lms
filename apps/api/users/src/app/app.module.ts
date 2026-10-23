import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {DbModule} from "@lms/db"
import {RedisModule} from "@lms/redis"
import { Users, Userschema } from './schema/userschema';
import { Tutors, TutorsSchema } from './schema/tutorsprofie';
import { Students, Studentsschema } from './schema/studentprofile';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [
     ConfigModule.forRoot({ isGlobal: true }),
     EventEmitterModule.forRoot(),
     DbModule.forRoot(process.env.MONGO_URI),
     RedisModule.forRoot({keyPrefix:"users:"}) ,
     DbModule.forFeature([{ name: Users.name, schema: Userschema }]) ,
     DbModule.forFeature([{ name: Tutors.name, schema: TutorsSchema }]) ,
     DbModule.forFeature([{ name: Students.name, schema: Studentsschema }]) 

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}






