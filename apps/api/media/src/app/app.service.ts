import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Readable } from 'stream';
import { CLOUDINARY } from './cloudinary.provider';

export interface UploadedImage {
  url: string;
  publicId: string;
}

@Injectable()
export class AppService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: any) {}

  upload(buffer: Buffer, folder = 'uploads'): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error: any, result: any) => {
          if (error || !result) {
            return reject(
              new RpcException({
                statusCode: 502,
                message: error?.message ?? 'Image upload failed',
              }),
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  async delete(publicId: string) {
    const res = await this.cloudinary.uploader.destroy(publicId);
    return { deleted: res.result === 'ok' };
  }
}