import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MediaClient } from './mediaclient.service';
import { MEDIA_QUEUE, MEDIA_SERVICE } from './contracts';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MEDIA_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: MEDIA_QUEUE,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [MediaClient],
  exports: [MediaClient],
})
export class MediaClientModule {}