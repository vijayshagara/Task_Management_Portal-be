import { Readable } from 'stream';
import type { Express } from 'express';
import { GridFSBucket, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { ensureMongoConnected, getMongoDb } from '../config/mongodb';
import CowImageBlob from '../models/cow-image-blob.model';

const BUCKET_NAME = 'cow_images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PG_PREFIX = 'pg:';

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

  private static async saveToPostgres(
    cowId: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const [blob] = await CowImageBlob.upsert(
      { cowId, data: buffer, contentType },
      { returning: true }
    );
    const id = (blob as CowImageBlob).id;
    return `${PG_PREFIX}${id}`;
  }

  public static async uploadCowImage(
    cowId: string,
    file: Express.Multer.File,
    existingFileId?: string | null
  ): Promise<string> {
    this.validateFile(file.mimetype, file.size);

    const { buffer, contentType } = await this.processImage(file.buffer, file.mimetype);

    if (existingFileId) {
      await this.deleteByFileId(existingFileId);
    }

    const mongoReady = await ensureMongoConnected();
    if (mongoReady) {
      const bucket = this.getBucket();
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(`cow-${cowId}`, {
          metadata: { cowId, contentType },
        });
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
        uploadStream.end(buffer);
      });
    }

    return this.saveToPostgres(cowId, buffer, contentType);
  }

  public static async getCowImageStream(
    fileId: string,
    cowId?: string
  ): Promise<{ stream: NodeJS.ReadableStream; contentType: string }> {
    if (fileId.startsWith(PG_PREFIX)) {
      const blob = await CowImageBlob.findByPk(fileId.slice(PG_PREFIX.length));
      if (!blob) throw new Error('Image not found');
      return {
        stream: Readable.from(blob.data),
        contentType: blob.contentType,
      };
    }

    const mongoReady = await ensureMongoConnected();
    if (mongoReady && ObjectId.isValid(fileId)) {
      const bucket = this.getBucket();
      const objectId = new ObjectId(fileId);
      const files = await bucket.find({ _id: objectId }).toArray();
      if (files.length) {
        const file = files[0];
        const contentType =
          (file.metadata as { contentType?: string })?.contentType || 'image/jpeg';
        return {
          stream: bucket.openDownloadStream(objectId),
          contentType,
        };
      }
    }

    // Fallback: lookup by cowId in PostgreSQL (e.g. after re-upload without mongo)
    if (cowId) {
      const blob = await CowImageBlob.findOne({ where: { cowId } });
      if (blob) {
        return {
          stream: Readable.from(blob.data),
          contentType: blob.contentType,
        };
      }
    }

    throw new Error('Image not found');
  }

  public static async deleteByFileId(fileId: string): Promise<void> {
    if (fileId.startsWith(PG_PREFIX)) {
      await CowImageBlob.destroy({ where: { id: fileId.slice(PG_PREFIX.length) } });
      return;
    }

    if (ObjectId.isValid(fileId)) {
      const mongoReady = await ensureMongoConnected();
      if (mongoReady) {
        const bucket = this.getBucket();
        try {
          await bucket.delete(new ObjectId(fileId));
        } catch {
          // already deleted
        }
      }
    }
  }

  /** Returns true if any image storage backend is available */
  public static async isStorageAvailable(): Promise<boolean> {
    return true; // PostgreSQL fallback is always available when DB is connected
  }
}
