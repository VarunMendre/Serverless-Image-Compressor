import { processAndStorageImage } from './services/imageService.js';

/**
 * Handler for S3 Events
 */
export const processImage = async (event) => {
  const destBucket = process.env.COMPRESSED_BUCKET;

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const prefix = process.env.COMPRESSED_PREFIX || 'compressed-';

    // Safety check: Prevent recursive loops
    if (key.startsWith(prefix)) {
      console.log(`Skipping already processed file with prefix "${prefix}": ${key}`);
      continue;
    }

    try {
      await processAndStorageImage(bucket, key, destBucket);
    } catch (error) {
      console.error(`Error processing ${bucket}/${key}:`, error);
    }
  }
};
