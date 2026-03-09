# MinIO Local Setup Guide

Manual setup instructions for local MinIO development.

## 1. Start MinIO

```bash
docker compose -f deployments/docker-compose.local.yml up -d minio
```

## 2. Access MinIO Console

Open https://minio.hoalu.localhost in your browser.

**Login credentials:**
- Username: `minioadmin`
- Password: `minioadmin`

## 3. Create Bucket

1. Click "Buckets" in the left sidebar
2. Click "Create Bucket"
3. Bucket Name: `hoalu-uploads`
4. Click "Create Bucket"

## 4. Configure CORS (Required for Browser Uploads)

1. Go to your bucket → "Anonymous" tab
2. Click "Add Access Rule"
3. Set:
   - Prefix: `/`
   - Access: `readonly`
4. Go to bucket → "Configuration" → "CORS"
5. Add CORS rule:
   ```json
   {
     "cors": [
       {
         "allowedOrigins": ["https://hoalu.localhost"],
         "allowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "allowedHeaders": ["*"],
         "exposeHeaders": ["ETag"],
         "maxAgeSeconds": 3600
       }
     ]
   }
   ```

## 5. Update Environment Variables

Add to your `.env` file:

```bash
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=hoalu-uploads
S3_ENDPOINT=http://localhost:9000
```

## Done!

File uploads should now work locally. You can browse uploaded files at https://minio.hoalu.localhost

## Optional: Using mc (MinIO Client)

Install mc for command-line management:

```bash
# macOS
brew install minio/stable/mc

# Linux
curl -sL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc
chmod +x /usr/local/bin/mc
```

Configure and use:

```bash
# Set alias
mc alias set local http://localhost:9000 minioadmin minioadmin

# List buckets
mc ls local

# List files in bucket
mc ls local/hoalu-uploads
```
