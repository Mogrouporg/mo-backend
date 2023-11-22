const cron = require("node-cron");
const { User } = require("../models/users.model");
const { sendMail } = require("../utils/mailer");
const { pushNotification } = require("../services/notif/notif.services");
const { notifyAllUsers } = require("../utils/notifyAllUsers.util");

exports.setUsersInactive = async () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Cron started");
    const AMonthsAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const inActiveUsers = await User.find({
      realEstateInvestment: null,
      createdAt: AMonthsAgo,
      balance: 0,
      transportInvestment: null,
      status: "active",
    }).lean();
    if (inActiveUsers.length > 0) {
      inActiveUsers.forEach(async (user) => {
        await User.updateOne(
          { _id: user._id },
          { $set: { status: "inactive" } }
        );
      });
      let subject = "Notice for the Inactivity on your account";
      let text =
        "Your account has been inactive for the past 30 days, please make sure you Transact on our platform.😑";
      await notifyAllUsers(inActiveUsers, subject, text);
    } else {
      console.log("No inactive users at the moment!");
    }
  });
};
