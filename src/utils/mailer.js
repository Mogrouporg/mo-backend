const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the transporter outside of the sendMail function
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  auth: {
    user: 'mailmogroupltd@gmail.com',
    pass: process.env.PASS_TEST
  }
});

const sendMail = async (options) => {
  let message = {
    from: 'MO Group <info@mogroupltd.com>',
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    return info;
  } catch (error) {
    // Handle the error appropriately
    console.error('Error sending email:', error);
    throw error; // Rethrow or handle the error as needed
  }
};

// Export the sendMail function and the transporter
module.exports = {
  sendMail,
  transporter
};

