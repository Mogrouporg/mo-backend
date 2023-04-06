const mongoose = require("mongoose");
const Schema = require('mongoose').Schema;

const NotificationSchema = new Schema(
    {
        message: {
            type: String,
            required: true
        },
        email: {
            type: String,
            ref: 'User',
            required: true
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = {
    Notification: Notification
}