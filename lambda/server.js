import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const app = express();
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// Configure Multer for S3 upload
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.SOURCE_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

app.use(express.json());

// Root path for basic health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Serverless Image Compressor API is running (ESM)' });
});

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    res.status(200).json({
        message: 'Image uploaded successfully to Source Bucket',
        file: {
            name: req.file.key,
            location: req.file.location,
            bucket: req.file.bucket
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
