import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { config } from '../config/env.js';

const s3 = new S3Client({ region: config.region });

import { processAndStorageImage, getPresignedUrl } from '../services/imageService.js';

/**
 * Handles image upload response
 */
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No image file provided");

    const { key, bucket } = req.file;

    // LOCAL TESTING WORKAROUND:
    if (!process.env.LAMBDA_TASK_ROOT) {
        processAndStorageImage(bucket, key, config.destBucket)
            .catch(err => console.error(`[Local] Background compression failed:`, err));
    }

    return res.status(200).json(
        new ApiResponse(200, { key }, "Image uploaded successfully")
    );
});

/**
 * Checks image processing status
 */
export const checkStatus = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { destBucket, cloudFrontDomain, prefix } = config;
    const destKey = `${prefix}${key}`;

    // Check if the compressed file exists
    try {
        await s3.send(new HeadObjectCommand({ Bucket: destBucket, Key: destKey }));

        // If it exists, generate pre-signed URLs
        const previewUrl = await getPresignedUrl(destBucket, destKey);
        const downloadUrl = await getPresignedUrl(destBucket, destKey, 3600, key);

        const data = {
            status: 'completed',
            url: previewUrl, // URL for <img> tag
            downloadUrl: downloadUrl // URL for downloading
        };

        return res.status(200).json(new ApiResponse(200, data, "Image is completed"));

    } catch (error) {
        if (error.name === 'NotFound') {
            return res.status(200).json(new ApiResponse(200, { status: 'processing' }, "Image is processing"));
        }
        throw error;
    }
});
