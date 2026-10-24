export const MEDIA_SERVICE = 'MEDIA_SERVICE';
export const MEDIA_QUEUE = 'media_queue';

export const MEDIA_PATTERNS = {
  UPLOAD: 'media.upload',
  DELETE: 'media.delete',
} as const;

export interface UploadImagePayload {
  buffer: string; // base64
  folder?: string;
}

export interface UploadedImage {
  url: string;
  publicId: string;
}