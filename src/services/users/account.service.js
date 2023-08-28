const { User } = require('../../models/users.model');
const { sendMail } = require('../../utils/mailer')
const cronJob = require('cron')
const { Transaction } = require("../../models/transaction.model");
const { TransInvest } = require("../../models/transInvestments.model");
const { RealEstateInvestment } = require("../../models/realEstateInvestments.model");
const { imageUpload } = require("../../utils/imageUpload.util");

const calculateAllMyDailyROI = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('realEstateInvestment transportInvestment')
            .populate('realEstateInvestment')
            .populate('transportInvestment');

        const realEstateInvestment = user.realEstateInvestment;
        const transportInvestment = user.transportInvestment;

        const realEstateInvestmentROI = realEstateInvestment.map((investment) => {
            const { currentRoi } = investment;
            return currentRoi;
        });

        const transportInvestmentROI = transportInvestment.map((investment) => {
            const { currentRoi } = investment;
            return currentRoi;
        });

        const totalRealEstateInvestmentROI = realEstateInvestmentROI.reduce((a, b) => a + b, 0);
        const totalTransportInvestmentROI = transportInvestmentROI.reduce((a, b) => a + b, 0);
        const totalROI = totalRealEstateInvestmentROI + totalTransportInvestmentROI;

        return totalROI;
    } catch (error) {
        throw error; // Rethrow the error for higher-level error handling
    }
};

exports.myProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId, '-password -refreshTokenHash');
        const dailyRoi = await calculateAllMyDailyROI(userId); // Calculate daily ROI

        user.dailyRoi = dailyRoi;

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

exports.getMyInvestments = async (req, res) => {
    try {
        const _id = req.user._id;
        const myInvestments = await User.findById(_id)
    .select('realEstateInvestment transportInvestment')
    .populate({
        path: 'realEstateInvestment',
    },
    {
        path: 'transportInvestment'
    })
    }catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

