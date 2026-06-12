const { PublishCommand } = require("@aws-sdk/client-sns");
const { snsClient, awsConfig, isAwsConfigured } = require("../config/aws.config");

/**
 * Publishes a notification message to the AWS SNS Topic
 * @param {string} subject - Email subject line
 * @param {string} message - Email content body
 */
async function sendNotification(subject, message) {
  if (!isAwsConfigured || !awsConfig.snsTopicArn || awsConfig.snsTopicArn.trim() === '' || awsConfig.snsTopicArn.startsWith('arn:aws:sns:us-east-1:123456789012')) {
    console.log('SNS notification suppressed (AWS not configured, mock ARN, or mock credentials). Logging to console instead.', { subject });
    console.log(`\n================= [MOCK SNS EMAIL] =================\nSubject: ${subject}\nMessage:\n${message}\n====================================================\n`);
    return null;
  }

  const params = {
    TopicArn: awsConfig.snsTopicArn,
    Subject: subject,
    Message: message
  };

  try {
    console.log('Publishing SNS notification', { subject, topicArn: awsConfig.snsTopicArn });
    
    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    
    console.log('SNS notification sent successfully', { messageId: result.MessageId });
    return result;
  } catch (error) {
    console.error('SNS notification publish failed', { error: error.message, subject });
    // Soft failure: do not throw error so the user request flow is not broken
    return null;
  }
}

module.exports = {
  sendNotification
};
