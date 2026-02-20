import serverless from 'serverless-http';
import app from './server.js';
import { processImage } from './processor.js';
import { validateEnv } from './config/env.js';

const serverlessHandler = serverless(app);

/**
 * Main Lambda Handler Orchestrator
 */
export const handler = async (event, context) => {
  validateEnv(); // Fail fast if misconfigured
  const isS3Event = event.Records && event.Records[0].s3;

  console.log(`[Event] ${isS3Event ? 'S3 (Processing)' : 'HTTP (Express)'} detected`);

  return isS3Event
    ? await processImage(event)
    : await serverlessHandler(event, context);
};
