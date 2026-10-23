import { REDIS_CLIENT } from '@lms/redis';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AppService {

  constructor( @Inject(REDIS_CLIENT) private readonly redis: Redis,){}
  getData(): { message: string } {
    return ({ message: 'Hello API' });
  }
}
