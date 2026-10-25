import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {DbModule} from "@lms/db"
import{MediaClientModule} from"@lms/medias";
import{RedisModule} from"@lms/redis";
import { Courses, coursesSchema } from './schema/course.schema';


@Module({
  imports: [

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
