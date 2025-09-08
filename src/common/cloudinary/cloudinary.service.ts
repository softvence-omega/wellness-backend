import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {
  uploadBuffer(
    buffer: Buffer,
    folder = 'templates',
    resourceType: 'video' | 'image' | 'raw' = 'video',
    extra?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, ...extra },
        (err, result) => {
          if (err) return reject(new InternalServerErrorException(err.message));
          resolve(result as UploadApiResponse);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }
}
