const { PublishCommand, SubscribeCommand } = require("@aws-sdk/client-sns");
const { snsClient, awsConfig, isAwsConfigured } = require("../config/aws.config");

/**
 * Subscribes an email address to the AWS SNS Topic with a specific filter policy
 * @param {string} email - Recipient email address
 * @param {object} filterPolicy - JSON filter policy object
 */
async function subscribeEmail(email, filterPolicy) {
  if (!isAwsConfigured || !awsConfig.snsTopicArn || awsConfig.snsTopicArn.trim() === '' || awsConfig.snsTopicArn.startsWith('arn:aws:sns:us-east-1:123456789012')) {
    console.log('SNS subscription suppressed (AWS not configured, mock ARN, or mock credentials). Logging to console instead.', { email, filterPolicy });
    return null;
  }

  const params = {
    TopicArn: awsConfig.snsTopicArn,
    Protocol: "email",
    Endpoint: email,
    Attributes: {
      FilterPolicy: JSON.stringify(filterPolicy)
    }
  };

  try {
    console.log('Creating SNS email subscription', { email, filterPolicy });
    const command = new SubscribeCommand(params);
    const result = await snsClient.send(command);
    console.log('SNS subscription request sent successfully', { subscriptionArn: result.SubscriptionArn });
    return result;
  } catch (error) {
    console.error('SNS subscription failed', { error: error.message, email });
    return null;
  }
}

/**
 * Publishes a notification message to the AWS SNS Topic
 * @param {string} subject - Email subject line
 * @param {string} message - Email content body
 * @param {object} [recipient] - Optional recipient object, e.g. { email: 'user@example.com' } or { role: 'Admin' }
 */
async function sendNotification(subject, message, recipient) {
  if (!isAwsConfigured || !awsConfig.snsTopicArn || awsConfig.snsTopicArn.trim() === '' || awsConfig.snsTopicArn.startsWith('arn:aws:sns:us-east-1:123456789012')) {
    console.log('SNS notification suppressed (AWS not configured, mock ARN, or mock credentials). Logging to console instead.', { subject, recipient });
    console.log(`\n================= [MOCK SNS EMAIL] =================\nRecipient: ${JSON.stringify(recipient)}\nSubject: ${subject}\nMessage:\n${message}\n====================================================\n`);
    return null;
  }

  const params = {
    TopicArn: awsConfig.snsTopicArn,
    Subject: subject,
    Message: message
  };

  if (recipient) {
    params.MessageAttributes = {};
    if (recipient.email) {
      params.MessageAttributes.email = {
        DataType: 'String',
        StringValue: recipient.email
      };
    } else if (recipient.role) {
      params.MessageAttributes.role = {
        DataType: 'String',
        StringValue: recipient.role
      };
    }
  }

  try {
    console.log('Publishing SNS notification', { subject, topicArn: awsConfig.snsTopicArn, recipient });
    
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
  subscribeEmail,
  sendNotification
};

