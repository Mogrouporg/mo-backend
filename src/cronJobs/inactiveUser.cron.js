const cron = require('node-cron');
const { User } = require('../models/users.model');
const { sendMail } = require('../utils/mailer');
const { pushNotification } = require('../services/notif/notif.services')

exports.setUsersInactive = async ()=>{
    cron.schedule('0 0 * * *', async ()=>{
        console.log('Cron started');
        const sixMonthsAgo = new Date(Date.now()- (6 * 30 * 24 * 60 * 60 * 1000))
        const inActiveUsers = User.find({ updatedAt: sixMonthsAgo, status: 'active' });

        if(inActiveUsers > 0){
            //await User.updateMany({ _id: { $in: inActiveUsers.map(user=> user._id)}}, { status: 'inactive'});
            for (const user in inActiveUsers) {
                await sendMail({
                    email: user.email,
                    subject: "Notice for the Inactivity on your account",
                    text: "Your account has been inactive for the past 90 days, please make sure you login to your account for us to know you are active.😑"
                })
                await pushNotification({
                    message: "Your account is Inactive, login to let us know you are active.",
                    email: user.email
                })
            }
            await inActiveUsers.update({ status: 'inactive'}, { new: true })
        }else{
            console.log("No inactive users at the moment!");
        }
    })
}