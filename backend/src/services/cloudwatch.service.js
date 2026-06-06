const { CreateLogStreamCommand, PutLogEventsCommand } = require("@aws-sdk/client-cloudwatch-logs");
const { cloudWatchClient, awsConfig } = require("../config/aws.config");
require('dotenv').config();

const logGroupName = awsConfig.cloudWatchLogGroup;
const logStreamName = `app-stream-${new Date().toISOString().split('T')[0]}`;

let streamInitialized = false;
let sequenceToken = null;

/**
 * Ensures the Log Stream exists in CloudWatch
 */
async function initializeLogStream() {
  if (streamInitialized) return true;

  // Skip AWS SDK call if running in local test mode without AWS configured
  if (
    (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'mock_access_key') &&
    !process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI &&
    !process.env.AWS_EC2_METADATA_DISABLED
  ) {
    return false;
  }

  try {
    const command = new CreateLogStreamCommand({
      logGroupName,
      logStreamName
    });
    await cloudWatchClient.send(command);
    streamInitialized = true;
    return true;
  } catch (error) {
    if (error.name === 'ResourceAlreadyExistsException') {
      streamInitialized = true;
      return true;
    } else {
      console.warn('[CloudWatch Logger] Initialization failed:', error.message);
      return false;
    }
  }
}

/**
 * Sends a log entry to CloudWatch (and console)
 */
async function logToCloudWatch(level, message, metadata = {}) {
  const timestampStr = new Date().toISOString();
  const logMessage = `[${timestampStr}] [${level.toUpperCase()}] ${message} - Metadata: ${JSON.stringify(metadata)}`;
  
  // Output to standard console for developers
  if (level === 'error') {
    console.error(logMessage);
  } else if (level === 'warn') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }

  const isAwsConfigured = await initializeLogStream();
  if (!isAwsConfigured) return;

  try {
    const logEvent = {
      message: logMessage,
      timestamp: Date.now()
    };

    const params = {
      logGroupName,
      logStreamName,
      logEvents: [logEvent]
    };

    if (sequenceToken) {
      params.sequenceToken = sequenceToken;
    }

    const command = new PutLogEventsCommand(params);
    const response = await cloudWatchClient.send(command);
    sequenceToken = response.nextSequenceToken;
  } catch (error) {
    // If sequence token goes out of sync, clear it so next logs try fresh
    if (error.name === 'InvalidSequenceTokenException') {
      sequenceToken = error.expectedSequenceToken;
    } else {
      console.error('[CloudWatch Logger] PutLogEvents failed:', error.message);
    }
  }
}

module.exports = {
  logInfo: (msg, meta) => logToCloudWatch('info', msg, meta),
  logWarn: (msg, meta) => logToCloudWatch('warn', msg, meta),
  logError: (msg, meta) => logToCloudWatch('error', msg, meta)
};
