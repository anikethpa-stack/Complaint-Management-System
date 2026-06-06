const { PublishCommand } = require("@aws-sdk/client-sns");
const { snsClient, awsConfig } = require("../config/aws.config");
const { logInfo, logError } = require("./cloudwatch.service");

/**
 * Publishes a notification message to the AWS SNS Topic
 * @param {string} subject - Email subject line
 * @param {string} message - Email content body
 */
async function sendNotification(subject, message) {
  if (!awsConfig.snsTopicArn || awsConfig.snsTopicArn.trim() === '' || awsConfig.snsTopicArn.startsWith('arn:aws:sns:us-east-1:123456789012')) {
    logInfo('SNS notification suppressed (ARN not configured or mock). Logging to console instead.', { subject });
    console.log(`\n================= [MOCK SNS EMAIL] =================\nSubject: ${subject}\nMessage:\n${message}\n====================================================\n`);
    return null;
  }

  const params = {
    TopicArn: awsConfig.snsTopicArn,
    Subject: subject,
    Message: message
  };

  try {
    logInfo('Publishing SNS notification', { subject, topicArn: awsConfig.snsTopicArn });
    
    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    
    logInfo('SNS notification sent successfully', { messageId: result.MessageId });
    return result;
  } catch (error) {
    logError('SNS notification publish failed', { error: error.message, subject });
    // Soft failure: do not throw error so the user request flow is not broken
    return null;
  }
}

module.exports = {
  sendNotification
};
