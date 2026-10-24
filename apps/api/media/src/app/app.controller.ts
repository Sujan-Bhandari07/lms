import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly media: AppService) {}

  @MessagePattern({ cmd: 'media.upload' })
  upload(@Payload() data: { buffer: string; folder?: string }) {
    // strip "data:image/png;base64," prefix if the frontend sent one
    const base64 = data.buffer.replace(/^data:.*;base64,/, '');
    return this.media.upload(Buffer.from(base64, 'base64'), data.folder);
  }

  @MessagePattern({ cmd: 'media.delete' })
  delete(@Payload() data: { publicId: string }) {
    return this.media.delete(data.publicId);
  }
}