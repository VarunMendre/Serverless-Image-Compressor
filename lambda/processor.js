import { processAndStorageImage } from './services/imageService.js';
import { config } from './config/env.js';

/**
 * Handler for S3 Events
 */
export const processImage = async (event) => {
  const { destBucket, prefix } = config;

  const tasks = event.Records
    .map(record => ({
      bucket: record.s3.bucket.name,
      key: decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))
    }))
    .filter(({ key }) => !key.startsWith(prefix))
    .map(({ bucket, key }) => processAndStorageImage(bucket, key, destBucket));

  return await Promise.all(tasks);
};
