import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CustomLogger } from 'src/logger/logger.service';

@Injectable()
export class CloudinaryService {
  private readonly logger = new CustomLogger();

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const context = 'CloudinaryService.uploadImage';

    try {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Validate file size (max 5MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException('File size must be less than 10MB');
      }

      this.logger.debug('Uploading image to Cloudinary', context, {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'meals',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { format: 'webp' }, // Convert to webp for better performance
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });

      this.logger.log('Image uploaded successfully', context, {
        public_id: result.public_id,
        url: result.secure_url,
      });

      return result.secure_url;
    } catch (error) {
      this.logger.error('Failed to upload image', error.stack, context, {
        error: error.message,
        filename: file.originalname,
      });

      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to upload image');
    }
  }

  async uploadPDF(file: Express.Multer.File): Promise<string> {
    const context = 'CloudinaryService.uploadPDF';

    try {
      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Only PDF files are allowed');
      }

      // Validate file size (max 10MB for PDFs)
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException('PDF file size must be less than 10MB');
      }

      this.logger.debug('Uploading PDF to Cloudinary', context, {
        originalname: file.originalname,
        size: file.size,
      });

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'meal-documents',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });

      this.logger.log('PDF uploaded successfully', context, {
        public_id: result.public_id,
        url: result.secure_url,
      });

      return result.secure_url;
    } catch (error) {
      this.logger.error('Failed to upload PDF', error.stack, context, {
        error: error.message,
        filename: file.originalname,
      });

      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to upload PDF');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    const context = 'CloudinaryService.deleteFile';

    try {
      this.logger.debug('Deleting file from Cloudinary', context, { publicId });

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete file: ${result.result}`);
      }

      this.logger.log('File deleted successfully', context, { publicId });
    } catch (error) {
      this.logger.error('Failed to delete file', error.stack, context, {
        publicId,
        error: error.message,
      });
      throw new BadRequestException('Failed to delete file');
    }
  }

  extractPublicId(url: string): string | null {
    const matches = url.match(
      /\/upload\/(?:v\d+\/)?(.+)\.(?:jpg|png|webp|pdf|jpeg)/,
    );
    return matches ? matches[1] : null;
  }
  extractPublicIdOrThrow(url: string): string {
    const publicId = this.extractPublicId(url);
    if (!publicId) {
      throw new BadRequestException('Could not extract public ID from URL');
    }
    return publicId;
  }
}
