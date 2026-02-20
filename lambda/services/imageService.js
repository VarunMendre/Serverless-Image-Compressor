import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { config } from '../config/env.js';

const s3 = new S3Client({ region: config.region });

/**
 * Downloads an image from an S3 bucket
 */
const downloadImage = async (bucket, key) => {
  const { Body, ContentType } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const buffer = Buffer.from(await Body.transformToByteArray());
  return { buffer, contentType: ContentType };
};

/**
 * Compresses an image using Sharp
 */
const compressImage = async (buffer) => {
  const image = sharp(buffer);
  const { format } = await image.metadata();

  const transformers = {
    jpeg: (img) => img.jpeg({ quality: config.quality, mozjpeg: true }),
    jpg: (img) => img.jpeg({ quality: config.quality, mozjpeg: true }),
    png: (img) => img.png({ quality: config.quality, palette: true, compressionLevel: 9 }),
    webp: (img) => img.webp({ quality: config.quality, lossless: false }),
  };

  const result = image
    .rotate()
    .resize({ width: config.width, withoutEnlargement: true })
    .withMetadata({ strip: true });

  return await (transformers[format] ? transformers[format](result) : result).toBuffer();
};

/**
 * Uploads a buffer to an S3 bucket
 */
const uploadImage = async (bucket, key, buffer, contentType) => {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }));
};

/**
 * Deletes an object from an S3 bucket
 */
const deleteImage = async (bucket, key) => {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

/**
 * Orchestrates the full image processing lifecycle
 */
export const processAndStorageImage = async (bucket, key, destBucket) => {
  console.log(`[Service] Processing: ${bucket}/${key}`);

  const { buffer, contentType } = await downloadImage(bucket, key);
  const compressedBuffer = await compressImage(buffer);
  const destKey = `${config.prefix}${key}`;

  await uploadImage(destBucket, destKey, compressedBuffer, contentType);
  await deleteImage(bucket, key);

  return { destBucket, destKey };
};
