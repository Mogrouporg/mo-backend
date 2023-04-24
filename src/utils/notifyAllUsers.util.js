//const User  = require('../models/users.model')
const { pushNotification } = require('../services/notif/notif.services')
const {sendMail} = require("./mailer");


exports.notifyAllUsers = async(users,subject, body)=>{
    try {
        for (let i = 0; i < users.length; i++) {
            await pushNotification({
                message: body,
                email: users[i].email
            });
            await sendMail({
                email: users[i].email,
                subject: subject,
                text: body
            });
        }
    }catch (e) {
        console.log(e)
    }
}