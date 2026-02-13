import serverless from 'serverless-http';
import app from './server.js';
import { processImage } from './processor.js';

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Check if it's an S3 event
  if (event.Records && event.Records[0].s3) {
    console.log('Detected S3 Event - Triggering Compression');
    return await processImage(event);
  }

  // Otherwise, handle as HTTP request (Express)
  console.log('Detected HTTP Event - Routing to Express');
  return await serverlessHandler(event, context);
};
