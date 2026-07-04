import { GridFSBucket, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { getMongoDb } from '../config/mongodb';

const BUCKET_NAME = 'cow_images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class CowImageService {
  private static getBucket(): GridFSBucket {
    return new GridFSBucket(getMongoDb(), { bucketName: BUCKET_NAME });
  }

  private static async processImage(
    buffer: Buffer,
    mimetype: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const pipeline = sharp(buffer).rotate().resize({
      width: 800,
      withoutEnlargement: true,
    });

    if (mimetype === 'image/png') {
      return {
        buffer: await pipeline.png({ quality: 80 }).toBuffer(),
        contentType: 'image/png',
      };
    }

    if (mimetype === 'image/webp') {
      return {
        buffer: await pipeline.webp({ quality: 70 }).toBuffer(),
        contentType: 'image/webp',
      };
    }

    return {
      buffer: await pipeline.jpeg({ quality: 70 }).toBuffer(),
      contentType: 'image/jpeg',
    };
  }

  public static validateFile(mimetype: string, size: number): void {
    if (!ALLOWED_TYPES.includes(mimetype)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }
    if (size > 2 * 1024 * 1024) {
      throw new Error('Image must be 2MB or smaller');
    }
  }

  public static async uploadCowImage(
    cowId: string,
    file: Express.Multer.File,
    existingFileId?: string | null
  ): Promise<string> {
    this.validateFile(file.mimetype, file.size);

    const { buffer, contentType } = await this.processImage(file.buffer, file.mimetype);
    const bucket = this.getBucket();

    if (existingFileId && ObjectId.isValid(existingFileId)) {
      await this.deleteByFileId(existingFileId);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(`cow-${cowId}`, {
        metadata: { cowId, contentType },
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.end(buffer);
    });
  }

  public static async getCowImageStream(fileId: string): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
  }> {
    if (!ObjectId.isValid(fileId)) {
      throw new Error('Invalid image reference');
    }

    const bucket = this.getBucket();
    const objectId = new ObjectId(fileId);

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files.length) {
      throw new Error('Image not found');
    }

    const file = files[0];
    const contentType =
      (file.metadata as { contentType?: string })?.contentType || 'image/jpeg';

    return {
      stream: bucket.openDownloadStream(objectId),
      contentType,
    };
  }

  public static async deleteByFileId(fileId: string): Promise<void> {
    if (!ObjectId.isValid(fileId)) return;

    const bucket = this.getBucket();
    try {
      await bucket.delete(new ObjectId(fileId));
    } catch {
      // File may already be deleted
    }
  }
}
