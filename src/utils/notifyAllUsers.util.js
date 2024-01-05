const {pushNotification} = require('../services/notif/notif.services')
const {sendMail, transporter} = require("./mailer");


const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 5000;

async function sendMailBatch(emailBatch, title, message) {
  return Promise.all(emailBatch.map(email => sendMail({
    email,
    subject: title,
    html: message
  })));
}

async function pushNotificationBatch(emailBatch, message) {
  return Promise.all(emailBatch.map(email => pushNotification({
    email,
    message
  })));
}

exports.notifyAllUsers = async (users, title, message) => {
  try {
    const emails = users.map(user => user);

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const emailBatch = emails.slice(i, i + BATCH_SIZE);

      // Use Promise.all to send emails and notifications in parallel
      await Promise.all([
        sendMailBatch(emailBatch, title, message),
        pushNotificationBatch(emailBatch, message)
      ]);

      // Introduce a delay between batches
      if (i + BATCH_SIZE < emails.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return true;

  } catch (error) {
    console.log(error);
  } finally {
    transporter.close();
  }
}

exports.notifyAdmin = async (title, message) => {
  try {
    const admins = await Admin.find({});
    const emails = admins.map(admin => admin.email);
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const emailBatch = emails.slice(i, i + BATCH_SIZE);

      // Use Promise.all to send emails and notifications in parallel
      await Promise.all([
        sendMailBatch(emailBatch, title, message),
        pushNotificationBatch(emailBatch, message)
      ]);

      // Introduce a delay between batches
      if (i + BATCH_SIZE < emails.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return true;


  } catch (error) {
    console.log(error);
  }

}
