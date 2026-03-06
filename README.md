# ImageShrink: Premium Serverless Image Compressor

A full-stack, event-driven serverless application that automatically compresses images using AWS Lambda, S3, and a modern React frontend.

**Live URL**: [https://img-compressor.cloudvault.cloud/](https://img-compressor.cloudvault.cloud/)

## 🚀 Features
- **Premium React Frontend**: Sleek, glassmorphic UI for easy drag-and-drop uploads.
- **Express.js on Lambda**: Robust API handling image uploads and status checks.
- **Automated Compression**: S3-triggered Lambda automatically processes images when they land in the source bucket.
- **Sharp Processing**: High-performance image processing using `libvips` (Sharp).
- **Smart Cleanup**: Automatically removes original images from the source bucket after successful compression.
- **Secure Access**: Pre-signed URLs for secure image preview and download.

## 🏗 Architecture
1. **User** uploads an image via the **React Frontend**.
2. **Lambda (Express)** receives the upload and puts it into **Bucket A (Source)**.
3. **S3 Event** triggers the **Lambda (Processor)** logic.
4. **Lambda** compresses the image using Sharp and uploads it to **Bucket B (Destination)**.
5. **Lambda** deletes the original from **Bucket A**.
6. **Frontend** polls the status and provides a **Pre-signed Download URL**.

## 📂 Project Structure
```text
serverless-image-compressor
│
├── frontend/               # React (Vite) Frontend
│   ├── src/
│   │   ├── App.jsx         # Main UI Logic
│   │   └── App.css         # Premium Styling
│   └── ...
│
├── lambda/                 # AWS Lambda Backend (Express + Processor)
│   ├── controllers/        # API Controllers
│   ├── services/           # Business Logic (S3 & Compression)
│   ├── index.js            # Lambda Entry Point
│   ├── server.js           # Express App
│   └── ...
│
├── serverless.yml          # Serverless Framework Configuration
└── README.md
```

## 🛠 Setup & Deployment

### Backend (AWS Lambda)
1. **S3 Buckets**: Create a Source and Destination bucket.
2. **Environment Variables**:
   - `SOURCE_BUCKET`: Raw images bucket.
   - `COMPRESSED_BUCKET`: Destination bucket.
   - `CLOUDFRONT_DOMAIN`: (Optional) For CDN delivery.
3. **Deploy**:
   ```bash
   cd lambda
   npm install
   serverless deploy
   ```

### Frontend (React)
1. **Environment Variables**:
   - `VITE_API_URL`: Your deployed API Gateway URL.
2. **Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🧪 Performance Demonstration
Our pipeline achieves massive compression ratios by stripping metadata and using optimized encoders. A typical high-resolution image (~562 KB) is often reduced to under **40 KB**—a **90%+ reduction** with minimal quality loss!

---
Developed as part of the AWS Serverless Image Compressor project.
