const { User } = require('../../models/users.model');
const { sendMail } = require('../../utils/mailer')
const cronJob = require('cron')
exports.myProfile =async(req, res)=>{
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            data: user
        });
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Interval Server error"
        })
    }
}

exports.editAccount = async (req, res)=>{
    try {
        const id = req.user.id;
        const body = req.body;
        await User.findByIdAndUpdate(id, {body}, { new: true });
        res.status(200).json({
            message: "User updated successfully!"
        });
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

exports.inActivateAccount = async (req, res)=>{
    try{

    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Interval server error"
        })
    }
}