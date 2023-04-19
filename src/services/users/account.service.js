const { User } = require('../../models/users.model');
const { sendMail } = require('../../utils/mailer')
const cronJob = require('cron')
const {Transaction} = require("../../models/transaction.model");
const {TransInvest} = require("../../models/transInvestments.model");
const {RealEstateInvestment} = require("../../models/realEstateInvestments.model");
const {imageUpload} = require("../../utils/imageUpload.util");
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
        if(!req.files){
            const body = req.body;
            await User.findByIdAndUpdate(id, {body}, { new: true });
            res.status(200).json({
                message: "User updated successfully!"
            });
        }else{
            const file = req.files.file;
            const folder = 'avatars'
            const url = await imageUpload(file, folder);
            console.log(url);
            await User.findByIdAndUpdate(id, { profile_url: url}, { new: true });
            res.status(200).json({
                success: true,
                data: url
            })
        }
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
        const myTransactions = await Transaction.find({ email: email }).select('amount status type');
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
exports.getMyInvestments = async(req, res)=>{
    try {
        const email = req.user.email;
        const myInvestments = await TransInvest.find({ user: 'email'}).select('status').populate('transportId') && await RealEstateInvestment.find({ user: email}).select('select').populate('propertyId')
        res.status(200).json({
            success: true,
            data: myInvestments
        })
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}
