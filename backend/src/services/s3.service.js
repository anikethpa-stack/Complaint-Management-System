const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client, awsConfig } = require("../config/aws.config");
const { logInfo, logError } = require("./cloudwatch.service");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Determine if we should use local fallback storage (when AWS credentials are not set)
const isAwsConfigured = 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key' &&
  process.env.AWS_ACCESS_KEY_ID !== 'mock_access_key' &&
  process.env.AWS_ACCESS_KEY_ID.trim() !== '';

/**
 * Uploads a file buffer from Multer memory storage to S3 bucket or local folder
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The public URL/path of the uploaded file
 */
async function uploadToS3(file) {
  const fileExtension = file.originalname.split('.').pop();
  const fileKey = `complaint-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExtension}`;

  if (!isAwsConfigured) {
    logInfo('AWS credentials not set. Falling back to local storage for upload.', { filename: file.originalname });
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const localFilePath = path.join(uploadsDir, fileKey);
      fs.writeFileSync(localFilePath, file.buffer);
      
      const port = process.env.PORT || 5000;
      const localUrl = `http://localhost:${port}/uploads/${fileKey}`;
      logInfo('Local upload fallback completed successfully', { localUrl });
      return localUrl;
    } catch (err) {
      logError('Local upload fallback failed', { filename: file.originalname, error: err.message });
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
    logInfo('Starting S3 evidence upload', { filename: file.originalname, mimetype: file.mimetype });
    
    // Send upload command
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Build standard public S3 URL
    const region = process.env.AWS_REGION || 'us-east-1';
    const s3Url = `https://${awsConfig.s3BucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    logInfo('S3 evidence upload completed', { s3Url });
    return s3Url;
  } catch (error) {
    logError('S3 evidence upload failed', { filename: file.originalname, error: error.message });
    throw new Error(`Failed to upload file to Amazon S3: ${error.message}`);
  }
}

module.exports = {
  uploadToS3
};
