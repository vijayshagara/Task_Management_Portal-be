/**
 * Copies existing cow images from MongoDB GridFS into PostgreSQL.
 * Run once locally (has MONGODB_URI + production DB in .env):
 *   npm run migrate:cow-images
 */
import { Readable } from 'stream';
import sequelize from '../config/database';
import { connectMongo, closeMongo } from '../config/mongodb';
import { Cow } from '../models/cow.model';
import CowImageBlob from '../models/cow-image-blob.model';
import { CowImageService } from '../services/cow-image.service';

const PG_PREFIX = 'pg:';

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function migrate() {
  await sequelize.authenticate();
  const mongoOk = await connectMongo();
  if (!mongoOk) {
    throw new Error('MONGODB_URI required locally to read existing images');
  }

  const cows = await Cow.findAll({ where: {} });
  let migrated = 0;

  for (const cow of cows) {
    if (!cow.image || cow.image.startsWith(PG_PREFIX)) continue;

    try {
      const { stream, contentType } = await CowImageService.getCowImageStream(
        cow.image,
        cow.id
      );
      const buffer = await streamToBuffer(stream);

      const [blob] = await CowImageBlob.upsert({
        cowId: cow.id,
        data: buffer,
        contentType,
      });

      const newRef = `${PG_PREFIX}${blob.id}`;
      await cow.update({ image: newRef });
      console.log(`✓ Migrated ${cow.name} (${cow.id}) → ${newRef}`);
      migrated += 1;
    } catch (err: any) {
      console.warn(`✗ Skipped ${cow.name}: ${err.message}`);
    }
  }

  console.log(`\nDone. Migrated ${migrated} cow image(s).`);
  await sequelize.close();
  await closeMongo();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
