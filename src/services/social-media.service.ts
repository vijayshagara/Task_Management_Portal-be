import { GridFSBucket, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { getMongoDb, isMongoConnected } from '../config/mongodb';

const BUCKET_NAME = 'social_media';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

export class SocialMediaService {
  private static getBucket(): GridFSBucket {
    if (!isMongoConnected()) {
      throw new Error('Media storage is not configured. Set MONGODB_URI in .env');
    }
    return new GridFSBucket(getMongoDb(), { bucketName: BUCKET_NAME });
  }

  private static async processImage(
    buffer: Buffer,
    mimetype: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const pipeline = sharp(buffer).rotate().resize({
      width: 1200,
      withoutEnlargement: true,
    });

    if (mimetype === 'image/png') {
      return { buffer: await pipeline.png({ quality: 80 }).toBuffer(), contentType: 'image/png' };
    }
    if (mimetype === 'image/webp') {
      return { buffer: await pipeline.webp({ quality: 75 }).toBuffer(), contentType: 'image/webp' };
    }
    return { buffer: await pipeline.jpeg({ quality: 75 }).toBuffer(), contentType: 'image/jpeg' };
  }

  public static validateFile(mimetype: string, size: number, isVideo = false): void {
    if (!ALLOWED_TYPES.includes(mimetype)) {
      throw new Error('Unsupported media type');
    }
    const maxSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (size > maxSize) {
      throw new Error(`File must be ${isVideo ? '15MB' : '5MB'} or smaller`);
    }
  }

  public static async upload(
    file: Express.Multer.File,
    prefix: string
  ): Promise<{ fileId: string; mediaType: 'image' | 'video' }> {
    const isVideo = file.mimetype.startsWith('video/');
    this.validateFile(file.mimetype, file.size, isVideo);

    const bucket = this.getBucket();
    let buffer = file.buffer;
    let contentType = file.mimetype;

    if (!isVideo) {
      const processed = await this.processImage(file.buffer, file.mimetype);
      buffer = processed.buffer;
      contentType = processed.contentType;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(`${prefix}-${Date.now()}`, {
        metadata: { prefix, contentType, mediaType: isVideo ? 'video' : 'image' },
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id.toString(),
          mediaType: isVideo ? 'video' : 'image',
        });
      });

      uploadStream.end(buffer);
    });
  }

  public static async getStream(fileId: string): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
  }> {
    if (!ObjectId.isValid(fileId)) {
      throw new Error('Invalid file id');
    }

    const bucket = this.getBucket();
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    if (!files.length) {
      throw new Error('File not found');
    }

    const file = files[0];
    const contentType =
      (file.metadata as { contentType?: string })?.contentType || 'application/octet-stream';

    return {
      stream: bucket.openDownloadStream(new ObjectId(fileId)),
      contentType,
    };
  }

  public static async deleteByFileId(fileId: string): Promise<void> {
    if (!isMongoConnected() || !ObjectId.isValid(fileId)) return;
    const bucket = this.getBucket();
    await bucket.delete(new ObjectId(fileId));
  }
}

export default SocialMediaService;
