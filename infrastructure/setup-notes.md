# AWS Infrastructure Setup Guide (Step-by-Step)

Follow these exact steps to deploy your Image Compression Pipeline.

---

## 1. Create S3 Buckets
1.  Log in to the **AWS Management Console**.
2.  Search for **S3** in the top search bar and click it.
3.  Click the orange **Create bucket** button.
4.  **Bucket Name**: Enter a name (e.g., `my-images-raw-xyz`).
5.  **Region**: Select a region (e.g., `us-east-1`). *Remember this region!*
6.  Scroll down and click **Create bucket**.
7.  **Repeat** these steps to create a second bucket (e.g., `my-images-compressed-xyz`).

---

## 2. Create IAM Execution Role
1.  Search for **IAM** and click it.
2.  Click **Roles** on the left sidebar, then click **Create role**.
3.  Select **AWS service** and choice **Lambda** from the "Service or use case" dropdown.
4.  Click **Next**.
5.  Click **Create policy** (it will open a new tab).
6.  In the Policy Editor, click the **JSON** tab and paste this:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": ["s3:GetObject", "s3:DeleteObject", "s3:PutObject"],
          "Resource": "arn:aws:s3:::YOUR_RAW_BUCKET_NAME/*"
        },
        {
          "Effect": "Allow",
          "Action": ["s3:PutObject"],
          "Resource": "arn:aws:s3:::YOUR_COMPRESSED_BUCKET_NAME/*"
        },
        {
          "Effect": "Allow",
          "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
          "Resource": "arn:aws:logs:*:*:*"
        }
      ]
    }
    ```
    *(Replace names with your actual bucket names)*.
7.  Click **Next**, name it `LambdaImageCompressorPolicy`, and click **Create policy**.
8.  Go back to the **Create role** tab, refresh the policies list, search for your new policy, and check the box next to it.
9.  Click **Next**, name the role `ImageCompressorRole`, and click **Create role**.

---

## 3. Create Lambda Function
1.  Search for **Lambda** and click it.
2.  Click **Create function**.
3.  Choose **Author from scratch**.
4.  **Function name**: `ImageCompressor`.
5.  **Runtime**: **Node.js 18.x** or higher.
6.  Click **Change default execution role**, select **Use an existing role**, and pick `ImageCompressorRole`.
7.  Click **Create function**.

---

## 4. Configure Lambda Settings
1.  Inside your function, go to the **Configuration** tab -> **General configuration**.
2.  Click **Edit**. Set **Timeout** to `20 seconds` and **Memory** to `512 MB`. Click **Save**.
3.  Go to **Configuration** tab -> **Environment variables**.
4.  Click **Edit** -> **Add environment variable**:
    - `SOURCE_BUCKET`: (your raw bucket name)
    - `COMPRESSED_BUCKET`: (your compressed bucket name)
    - `IMAGE_QUALITY`: `80`
    - `RESIZE_WIDTH`: `800`
5.  Click **Save**.

---

## 5. Deployment (Local to AWS)
1.  Open your local terminal (PowerShell or Bash) in the `lambda/` folder.
2.  **CRITICAL**: Delete your existing `node_modules` and `package-lock.json` to start clean:
    ```powershell
    # On Windows PowerShell
    Remove-Item -Recurse -Force node_modules, package-lock.json
    ```
3.  **Install for Linux**: Run this exact command to pull the Linux binaries instead of Windows ones:
    ```bash
    npm install --platform=linux --arch=x64 sharp
    ```
    *(Note: Use `--arch=arm64` if your Lambda architecture is set to arm64/Graviton).*
4.  Install remaining dependencies:
    ```bash
    npm install
    ```
5.  Select all files **inside** the `lambda/` folder (`index.js`, `server.js`, `processor.js`, `node_modules`, `package.json`, etc.) and zip them.
    -   *Crucial: Do NOT zip the folder itself, only the files inside it.*
6.  In AWS Lambda, under the **Code** tab, click **Upload from** -> **.zip file**.

---

## 🆘 Troubleshooting: "Cannot find module sharp-linux-x64.node"
If you see this error in CloudWatch, it means the Linux binary is missing.

### The Fix:
1.  Ensure you deleted `node_modules` before running the `--platform=linux` command.
2.  Check your Lambda **Architecture** (Configuration -> General). If it says `x86_64`, you need `--arch=x64`. If it says `arm64`, you need `--arch=arm64`.
3.  **For Sharp v0.33+ (Modern way)**: If the above fails, try:
    ```bash
    npm install --include=optional @img/sharp-linux-x64
    ```

---

## 6. Setup S3 Trigger
1.  Go back to your **Source S3 Bucket** page.
2.  Click the **Properties** tab.
3.  Scroll down to **Event notifications** and click **Create event notification**.
4.  **Event name**: `CompressOnUpload`.
5.  **Event types**: Check **All object create events**.
6.  **Destination**: Select **Lambda function** and pick your `ImageCompressor` function.
7.  Click **Save changes**.

---

## 7. Setup API Gateway (For Postman)
1.  Search for **API Gateway** and click it.
2.  Find **HTTP API** and click **Build**.
3.  Click **Add integration**, select **Lambda**, and pick your `ImageCompressor`.
4.  **API Name**: `ImageUploadAPI`. Click **Next**.
5.  **Configure routes**: Set Method to `ANY` and Resource path to `/{proxy+}`. Click **Next** -> **Next** -> **Create**.
6.  Copy the **Invoke URL**. 
7.  In Postman, use `POST {InvokeURL}/upload` with `form-data` and key `image`.
