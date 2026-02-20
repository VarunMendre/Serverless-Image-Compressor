/**
 * Environment variables configuration and validation
 */
const requiredEnvVars = [
    'SOURCE_BUCKET',
    'COMPRESSED_BUCKET',
    'AWS_REGION'
];

export const validateEnv = () => {
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    if (missing.length > 0) {
        throw new Error(`[Configuration Error] Missing required environment variables: ${missing.join(', ')}`);
    }
};

export const config = {
    sourceBucket: process.env.SOURCE_BUCKET,
    destBucket: process.env.COMPRESSED_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1',
    cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN,
    prefix: process.env.COMPRESSED_PREFIX || 'compressed-',
    quality: parseInt(process.env.IMAGE_QUALITY || '80', 10),
    width: parseInt(process.env.RESIZE_WIDTH || '800', 10)
};
