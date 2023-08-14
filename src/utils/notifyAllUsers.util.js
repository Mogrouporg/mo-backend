//const User  = require('../models/users.model')
const { pushNotification } = require('../services/notif/notif.services')
const {sendMail} = require("./mailer");
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
})

const sqs = new AWS.SQS();

const sendSQSMessage = async (message) => {
    const params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: process.env.AWS_SQS_URL
    }

    return await sqs.sendMessage(params).promise()
}

exports.notifyAllUsers = async(users,subject, body, onStart, onComplete)=>{
    try {
        onStart && onStart(); // Call onStart if provided

        for (let i = 0; i < users.length; i++) {
            const message = {
                email: users[i].email,
                subject,
                body
            }
            await sendSQSMessage(message)
        }

        onComplete && onComplete(); // Call onComplete if provided
    }catch (e) {
        console.log(e)
    }
}

let shouldProcessMessages = false;

const startProcessing = () => {
  shouldProcessMessages = true;
  processMessages();
};

const stopProcessing = () => {
  shouldProcessMessages = false;
};

const processMessages = async () => {
  if (!shouldProcessMessages) return;

  try {
    const params = {
      QueueUrl: process.env.AWS_SQS_URL,
      MaxNumberOfMessages: 10,
    };

    sqs.receiveMessage(params, async (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return;
      }
      if (!data.Messages) {
        return;
      }
      // ... rest of the code ...

      // Recursive call to keep processing if the condition is still met
      processMessages();
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.export   = {
    startProcessing,
    stopProcessing
}