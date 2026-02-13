# Infrastructure Setup & Deployment Notes

## 1. AWS S3 Buckets
Create two buckets in the same region:
- **Source Bucket**: e.g., `my-raw-images-bucket`
- **Compressed Bucket**: e.g., `my-compressed-images-bucket`

## 2. IAM Role Permissions
Your Lambda function needs an execution role with the following permissions:
- `s3:GetObject` and `s3:DeleteObject` on the **Source Bucket**.
- `s3:PutObject` on the **Compressed Bucket**.
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` for CloudWatch.

## 3. Environment Variables
Set these variables in the Lambda configuration:
- `AWS_NODEJS_CONNECTION_REUSE_ENABLED`: `1` (for performance)
- `SOURCE_BUCKET`: `my-raw-images-bucket`
- `COMPRESSED_BUCKET`: `my-compressed-images-bucket`

## 4. Lambda Configuration
- **Memory**: Recommended **512MB** or **1024MB** (Sharp is memory intensive).
- **Timeout**: Recommended **15-20 seconds**.
- **Runtime**: Node.js 18.x or 20.x.

## 5. Local Packaging for Lambda (CRITICAL)
Since the `sharp` library contains native binaries, you must install it for the Lambda Linux environment.

From the `lambda/` directory, run:
```bash
# Remove local Windows node_modules
rm -rf node_modules package-lock.json

# Install for Linux x64 (Standard Lambda architecture)
npm install --os=linux --cpu=x64 sharp
npm install
```
Then ZIP all files in the `lambda/` folder (not the folder itself) and upload to AWS.

## 6. S3 Trigger
Go to the **Source Bucket** -> **Properties** -> **Event Notifications**.
- Click **Create event notification**.
- Name: `TriggerImageCompression`.
- Event types: `s3:ObjectCreated:*`.
- Destination: **Lambda Function** (select your function).

## 7. API Gateway (Optional for Postman)
To use the Postman upload, create an **HTTP API** or **REST API**:
- Route: `ANY /{proxy+}` or just `POST /upload`.
- Integration: **Lambda Function**.
- **IMPORTANT**: If using REST API, enable **Binary Media Types** for `multipart/form-data`.
