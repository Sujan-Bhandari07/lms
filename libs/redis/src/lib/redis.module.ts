import { DynamicModule, Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { redisConfig } from './redis.config';
import { REDIS_CLIENT } from './redis.constant';

@Global()
@Module({})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  static forRoot(options: RedisOptions = {}): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: () => new Redis({ ...redisConfig(), ...options }),
        },
      ],
      exports: [REDIS_CLIENT],
    };
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}