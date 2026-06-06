const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client, awsConfig } = require("../config/aws.config");
const { logInfo, logError } = require("./cloudwatch.service");
require('dotenv').config();

/**
 * Uploads a file buffer from Multer memory storage to S3 bucket
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The public URL of the uploaded S3 file
 */
async function uploadToS3(file) {
  const fileExtension = file.originalname.split('.').pop();
  const fileKey = `evidence/complaint-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExtension}`;

  const params = {
    Bucket: awsConfig.s3BucketName,
    Key: fileKey,
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
    const s3Url = `https://${awsConfig.s3BucketName}.s3.${region}.amazonaws.com/${fileKey}`;

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
