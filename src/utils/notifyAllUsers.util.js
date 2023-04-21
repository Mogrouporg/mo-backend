//const User  = require('../models/users.model')
const { pushNotification } = require('../services/notif/notif.services')
const {sendMail} = require("./mailer");


exports.notifyAllUsers = async(users,subject, body)=>{
    try {
        let user
        for ( user.email in users) {
            await pushNotification({
                message: body,
                email: user.email
            });
            await sendMail({
                to: user.email,
                subject: subject,
                text: body
            });
        }
        console.log('Done')
    }catch (e) {
        console.log(e)
    }
}