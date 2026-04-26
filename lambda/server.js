import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import imageRouter from './routes/image.routes.js';

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://img-compressor.cloudvault.cloud',
        'http://varun-frontend-hosting.s3-website-ap-south-1.amazonaws.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', imageRouter);

// Root path for basic health check
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Serverless Image Compressor API is running (Modular)',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`[Error] ${statusCode}: ${message}`);
    if (err.stack) console.error(err.stack);

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

// Conditional listener for local development
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server running locally on http://localhost:${port}`);
        console.log(`📡 API Endpoints:`);
        console.log(`   - POST http://localhost:${port}/api/upload`);
        console.log(`   - GET  http://localhost:${port}/api/status/:key`);
    });
}

export default app;
