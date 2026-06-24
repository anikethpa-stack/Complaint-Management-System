const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client, awsConfig, isAwsConfigured } = require("../config/aws.config");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Uploads a file buffer from Multer memory storage to S3 bucket or local folder
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The S3 Key or local URL of the uploaded file
 */
async function uploadToS3(file) {
  const fileExtension = file.originalname.split('.').pop();
  const fileKey = `complaint-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExtension}`;

  if (!isAwsConfigured) {
    console.log('AWS credentials not set or mock. Falling back to local storage for upload.', { filename: file.originalname });
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const localFilePath = path.join(uploadsDir, fileKey);
      fs.writeFileSync(localFilePath, file.buffer);
      
      const port = process.env.PORT || 5000;
      const localUrl = `http://localhost:${port}/uploads/${fileKey}`;
      console.log('Local upload fallback completed successfully', { localUrl });
      return localUrl;
    } catch (err) {
      console.error('Local upload fallback failed', { filename: file.originalname, error: err.message });
      throw new Error(`Failed to save evidence file locally: ${err.message}`);
    }
  }

  const s3Key = `evidence/${fileKey}`;
  const params = {
    Bucket: awsConfig.s3BucketName,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    console.log('Starting S3 evidence upload', { filename: file.originalname, mimetype: file.mimetype });
    
    // Send upload command
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    console.log('S3 evidence upload completed', { s3Key });
    return s3Key;
  } catch (error) {
    console.error('S3 evidence upload failed', { filename: file.originalname, error: error.message });
    throw new Error(`Failed to upload file to Amazon S3: ${error.message}`);
  }
}

/**
 * Generates a short-lived pre-signed URL for viewing S3 objects.
 * Backward compatible with existing full HTTP URLs in the DB.
 * @param {string} s3KeyOrUrl - Raw S3 key or full legacy HTTP URL
 * @returns {Promise<string>} - The signed S3 URL or unchanged local URL
 */
async function generatePresignedUrl(s3KeyOrUrl) {
  if (!s3KeyOrUrl) return null;

  // Support legacy full URLs (Step 8 suggestion)
  let s3Key = s3KeyOrUrl;
  const bucketPart = '.amazonaws.com/';

  if (s3KeyOrUrl.startsWith('http://') || s3KeyOrUrl.startsWith('https://')) {
    if (s3KeyOrUrl.includes(bucketPart)) {
      s3Key = s3KeyOrUrl.split(bucketPart)[1];
    } else {
      // Local fallback URL or other non-S3 URL, return as is
      return s3KeyOrUrl;
    }
  }

  // If AWS is not configured, we cannot call getSignedUrl
  if (!isAwsConfigured) {
    console.log('AWS is not configured, returning raw S3 key/url.');
    return s3KeyOrUrl;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: awsConfig.s3BucketName,
      Key: s3Key
    });

    const signedUrl = await getSignedUrl(
      s3Client,
      command,
      {
        expiresIn: 3600 // 1 hour expiration
      }
    );

    return signedUrl;
  } catch (error) {
    console.error("Failed to generate pre-signed URL:", error.message);
    throw error;
  }
}

module.exports = {
  uploadToS3,
  generatePresignedUrl
};

