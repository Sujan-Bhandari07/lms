import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {DbModule} from "@lms/db"
import {RedisModule} from "@lms/redis"


@Module({
  imports: [
     ConfigModule.forRoot({ isGlobal: true }),
     DbModule.forRoot(process.env.MONGO_URI),
     RedisModule.forRoot({keyPrefix:"users:"})  

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}






