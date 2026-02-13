# AWS Serverless Image Compression Pipeline

A serverless, event-driven backend system that automatically compresses images uploaded via an Express.js endpoint or directly to an S3 bucket.

## 🚀 Features
- **Express.js on Lambda**: Single endpoint `POST /upload` for easy file uploads via Postman.
- **Automated Compression**: S3-triggered Lambda automatically compresses images when they land in the source bucket.
- **Sharp Processing**: High-performance image processing using `libvips` (Sharp).
- **Hybrid Handler**: A single code base handles both web requests and cloud events.
- **Smart Cleanup**: Automatically removes original images from the source bucket after successful compression.

## 🏗 Architecture
1. **User** sends an image to the API Gateway.
2. **Lambda (Express)** uploads the image to **Bucket A (Source)**.
3. **S3 Event** triggers **Lambda (Processor)**.
4. **Lambda** compresses the image and uploads it to **Bucket B (Destination)**.
5. **Lambda** deletes the original from **Bucket A**.

## 📂 Project Structure
```text
aws-serverless-image-compressor
│
├── lambda/
│   ├── index.js (Main Handler)
│   ├── server.js (Express App)
│   ├── processor.js (Compression Logic)
│   ├── package.json
│
├── infrastructure/
│   └── setup-notes.md (AWS Configuration Guide)
│
└── README.md
```

## 🛠 Setup & Deployment
Please refer to the [Setup Notes](infrastructure/setup-notes.md) for detailed instructions on:
- S3 Bucket creation
- IAM Role configuration
- Cross-platform `sharp` installation
- Environment variable setup

## 🧪 Testing with Postman
1. Create a `POST` request to your Lambda/API Gateway URL.
2. Under the **Body** tab, select **form-data**.
3. Add a key `image` and select your image file.
4. Send the request and check your S3 buckets!

---
Developed as part of the AWS Serverless Image Compressor project.
