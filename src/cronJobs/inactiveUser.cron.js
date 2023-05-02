const cron = require('node-cron');
const { User } = require('../models/users.model');
const { sendMail } = require('../utils/mailer');
const { pushNotification } = require('../services/notif/notif.services');

exports.setUsersInactive = async () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Cron started');
    const sixMonthsAgo = new Date(Date.now() - (1.5 * 30 * 24 * 60 * 60 * 1000));
    const inActiveUsers = await User.find({ realEstateInvestment: null, createdAt: sixMonthsAgo }).lean();

    if (inActiveUsers.length > 0) {
      const userEmails = inActiveUsers.map(user => user.email);
      await Promise.all([
        sendMail({
          email: userEmails,
          subject: "Notice for the Inactivity on your account",
          text: "Your account has been inactive for the past 90 days, please make sure you login to your account for us to know you are active.😑"
        }),
        pushNotification({
          message: "Your account is Inactive, login to let us know you are active.",
          email: userEmails
        }),
        User.updateMany({ _id: { $in: inActiveUsers.map(user => user._id) }}, { status: 'inactive'})
      ]);
    } else {
      console.log("No inactive users at the moment!");
    }
  });
};
