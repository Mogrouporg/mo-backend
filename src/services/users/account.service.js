const { User } = require('../../models/users.model');
const { sendMail } = require('../../utils/mailer')
const cronJob = require('cron')
const {Transaction} = require("../../models/transaction.model");
exports.myProfile =async(req, res)=>{
    try {
        const user = req.user.select('firstName lastName ');
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

exports.getMyTransactions = async(req, res)=>{
    try {
        const email = req.user.email;
        const myTransactions = await Transaction.find({ email: email });
        res.status(200).json({
            message: true,
            data: myTransactions
        })
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message:"Internal Server error"
        })
    }
}
