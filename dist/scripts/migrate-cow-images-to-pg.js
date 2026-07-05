"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const mongodb_1 = require("../config/mongodb");
const cow_model_1 = require("../models/cow.model");
const cow_image_blob_model_1 = __importDefault(require("../models/cow-image-blob.model"));
const cow_image_service_1 = require("../services/cow-image.service");
const PG_PREFIX = 'pg:';
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}
async function migrate() {
    await database_1.default.authenticate();
    const mongoOk = await (0, mongodb_1.connectMongo)();
    if (!mongoOk) {
        throw new Error('MONGODB_URI required locally to read existing images');
    }
    const cows = await cow_model_1.Cow.findAll({ where: {} });
    let migrated = 0;
    for (const cow of cows) {
        if (!cow.image || cow.image.startsWith(PG_PREFIX))
            continue;
        try {
            const { stream, contentType } = await cow_image_service_1.CowImageService.getCowImageStream(cow.image, cow.id);
            const buffer = await streamToBuffer(stream);
            const [blob] = await cow_image_blob_model_1.default.upsert({
                cowId: cow.id,
                data: buffer,
                contentType,
            });
            const newRef = `${PG_PREFIX}${blob.id}`;
            await cow.update({ image: newRef });
            console.log(`✓ Migrated ${cow.name} (${cow.id}) → ${newRef}`);
            migrated += 1;
        }
        catch (err) {
            console.warn(`✗ Skipped ${cow.name}: ${err.message}`);
        }
    }
    console.log(`\nDone. Migrated ${migrated} cow image(s).`);
    await database_1.default.close();
    await (0, mongodb_1.closeMongo)();
}
migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
