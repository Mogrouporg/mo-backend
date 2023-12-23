const {notifyAllUsers} = require('./notifyAllUsers.util');
const {changePassword} = require('./mailTemplates/changePassword');
const {User} = require('../models/users.model');


exports.notifyAllUsersMail = async (subject, message) => {
  try {
    const users = await User.find().select('email -_id');
    console.log(users);
    notifyAllUsers(users, subject, message);
    console.log('Email sent successfully');
  } catch (error) {
    console.log(error);
  }
};

exports.handlerMail = async (req, res) => {
  try {
    const mail = await changePassword()
    this.notifyAllUsersMail('Important: Reset Your Password for Mo Group Account', mail);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.log(error);
  }
};

