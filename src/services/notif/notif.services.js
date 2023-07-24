const {Notification} = require('../../models/notif.model');
const { User } = require('../../models/users.model');

exports.pushNotification = async (options)=>{
    try {
        const newNotif = new Notification({
            message: options.message,
            email: options.email,
        })
        await newNotif.save()
        const user = await User.findOne({email: options.email})
        user.notifications.push(newNotif.id)
        return newNotif.toObject()
    }catch (e) {
        console.log(e)
        new Error(e.stack)
    }
}

exports.findNotifById = async (req, res)=>{
    let email = req.user.email
    let notifications = await Notification.find({
        email: email
    }).sort({ createdAt: -1}).exec()
    return res.status(200).json({
        notifications
    })
}

