import { processAndStorageImage } from './services/imageService.js';

/**
 * Handler for S3 Events
 */
export const processImage = async (event) => {
  const destBucket = process.env.COMPRESSED_BUCKET;

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Safety check: Prevent recursive loops
    if (key.startsWith('compressed-')) {
      console.log(`Skipping already compressed file: ${key}`);
      continue;
    }

    try {
      await processAndStorageImage(bucket, key, destBucket);
    } catch (error) {
      console.error(`Error processing ${bucket}/${key}:`, error);
    }
  }
};
