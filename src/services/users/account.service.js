const { User } = require('../../models/users.model');
const { sendMail } = require('../../utils/mailer')
const cronJob = require('cron')
const { Transaction } = require("../../models/transaction.model");
const { TransInvest } = require("../../models/transInvestments.model");
const { RealEstateInvestment } = require("../../models/realEstateInvestments.model");
const { imageUpload } = require("../../utils/imageUpload.util");

exports.myProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id, '-password -refreshTokenHash');
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.editAccount = async (req, res) => {
    try {
        const id = req.user.id;
        if (!req.files) {
            const body = req.body;
            const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
            return res.status(200).json({
                message: "User updated successfully!",
                data: updatedUser
            });
        } else {
            const file = req.files.file;
            const folder = 'avatars';
            console.log(file);
            const url = await imageUpload(file, folder);
            console.log(url);
            const updatedUser = await User.findByIdAndUpdate(id, { profile_url: url }, { new: true });
            return res.status(200).json({
                success: true,
                data: updatedUser
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.addBankDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const { bankName, accountName, accountNumber } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { 
            $push: { bankDetails: { bankName, accountName, accountNumber } } 
        }, { new: true });
        return res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

exports.getMyTransactions = async (req, res) => {
    try {
        const _id = req.user._id;
        const myTransactions = await User.findById(_id)
    .select('transactions')
    .populate({
        path: 'transactions',
        match: { status: { $nin: ['Abandoned', 'Pending'] } },
        options: { sort: { 'createdAt': -1 } }
    });
        return res.status(200).json({
            success: true,
            data: myTransactions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// exports.getMyTransactions = async (req, res) => {
//     try {
//         const email = req.user.email;
//         const myInvestments = await Promise.all([
//             TransInvest.find({ email }).select("-_id"),
//             RealEstateInvestment.find({ email }).select("-_id")
//         ]);
//         return res.status(200).json({
//             success: true,
//             data: {
//                 transportInvestment: myInvestments[0],
//                 realEstateInvestment: myInvestments[1]
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: "Internal Server Error"
//         });
//     }
// };

exports.getSingleRealEstateInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const investment = await TransInvest.findById(id);
        return res.status(200).json({
            success: true,
            data: investment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.getSingleTransInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const investment = await TransInvest.findById(id);
        return res.status(200).json({
            success: true,
            data: investment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}