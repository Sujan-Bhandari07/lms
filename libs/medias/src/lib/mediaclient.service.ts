import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MEDIA_PATTERNS, MEDIA_SERVICE, UploadedImage } from './contracts';
import { instrumentRmqClient } from '@lms/filters';

@Injectable()
export class MediaClient {
  constructor(@Inject(MEDIA_SERVICE) private readonly client: ClientProxy) {
    this.client = instrumentRmqClient(this.client, 'media');
  }

  upload(base64: string, folder = 'uploads'): Promise<UploadedImage> {
    return firstValueFrom(
      this.client
        .send<UploadedImage>({ cmd: MEDIA_PATTERNS.UPLOAD }, { buffer: base64, folder })
        .pipe(timeout(30000)),
    );
  }

  delete(publicId: string) {
    return firstValueFrom(
      this.client
        .send<{ deleted: boolean }>({ cmd: MEDIA_PATTERNS.DELETE }, { publicId })
        .pipe(timeout(15000)),
    );
  }
}