const { S3Client } = require("@aws-sdk/client-s3");
const { SNSClient } = require("@aws-sdk/client-sns");
const { CloudWatchLogsClient } = require("@aws-sdk/client-cloudwatch-logs");
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';

// Configure SDK with region. 
// If explicit access keys are set (and not mock/example values), use them.
// Otherwise, let the AWS SDK automatically resolve credentials via IAM Role / Environment.
const sdkConfig = { region };

if (
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.AWS_ACCESS_KEY_ID !== 'your_access_key' &&
  process.env.AWS_ACCESS_KEY_ID !== 'mock_access_key' &&
  process.env.AWS_ACCESS_KEY_ID.trim() !== ''
) {
  sdkConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}

// Instantiate AWS clients
const s3Client = new S3Client(sdkConfig);
const snsClient = new SNSClient(sdkConfig);
const cloudWatchClient = new CloudWatchLogsClient(sdkConfig);

module.exports = {
  s3Client,
  snsClient,
  cloudWatchClient,
  awsConfig: {
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || 'student-grievance-evidence-bucket',
    snsTopicArn: process.env.AWS_SNS_TOPIC_ARN,
    cloudWatchLogGroup: process.env.AWS_CLOUDWATCH_LOG_GROUP || 'student-grievance-app-logs'
  }
};
