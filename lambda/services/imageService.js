import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Service to handle image processing lifecycle:
 * Download -> Compress -> Upload -> Delete
 */
export const processAndStorageImage = async (bucket, key, destBucket) => {
  console.log(`[Service] Processing image: ${bucket}/${key}`);

  // 1. Get the image from Source Bucket
  const { Body, ContentType } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  
  // Convert stream to buffer
  const buffer = Buffer.from(await Body.transformToByteArray());

  // 2. Compress the image using Sharp
  const image = sharp(buffer);
  const metadata = await image.metadata();

  let transformer = image.resize({ width: 800, withoutEnlargement: true });

  // Format-specific optimizations
  if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
    transformer = transformer.jpeg({ quality: 80 });
  } else if (metadata.format === 'png') {
    transformer = transformer.png({ quality: 80, compressionLevel: 9 });
  } else if (metadata.format === 'webp') {
    transformer = transformer.webp({ quality: 80 });
  }

  const compressedBuffer = await transformer.toBuffer();

  // 3. Upload to Destination Bucket
  const destKey = `compressed-${key}`;
  await s3.send(new PutObjectCommand({
    Bucket: destBucket,
    Key: destKey,
    Body: compressedBuffer,
    ContentType: ContentType
  }));
  console.log(`[Service] Successfully uploaded to: ${destBucket}/${destKey}`);

  // 4. Delete from Source Bucket
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log(`[Service] Successfully deleted from: ${bucket}/${key}`);

  return { destBucket, destKey };
};
