import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { config } from '../config/env.js';

const s3 = new S3Client({ region: config.region });

/**
 * Handles image upload response
 */
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No image file provided");

    return res.status(200).json(
        new ApiResponse(200, { key: req.file.key }, "Image uploaded successfully")
    );
});

/**
 * Checks image processing status
 */
export const checkStatus = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { destBucket, cloudFrontDomain, prefix } = config;
    const destKey = `${prefix}${key}`;

    const statuses = {
        completed: {
            status: 'completed',
            url: cloudFrontDomain ? `https://${cloudFrontDomain}/${destKey}` : null,
            s3Url: `https://${destBucket}.s3.amazonaws.com/${destKey}`
        },
        processing: { status: 'processing' }
    };

    const s3Status = await s3.send(new HeadObjectCommand({ Bucket: destBucket, Key: destKey }))
        .then(() => 'completed')
        .catch(err => err.name === 'NotFound' ? 'processing' : Promise.reject(err));

    return res.status(200).json(new ApiResponse(200, statuses[s3Status], `Image is ${s3Status}`));
});
