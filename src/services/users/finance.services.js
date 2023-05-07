const request = require('request');
const { initializePayment, verifyPayment } = require('../../utils/payment.utils')(request);
const { User } = require('../../models/users.model');
const { pushNotification } = require('../notif/notif.services');
const { Transaction } = require('../../models/transaction.model');
const { RealEstate } = require('../../models/realEstate.model');
const { RealEstateInvestment } = require('../../models/realEstateInvestments.model');
const {sendMail} = require("../../utils/mailer");

exports.deposit = async (req, res) => {
    try {
        const { email } = req.user;
        let { amount } = req.body;
        amount *= 100;
        if (!amount || amount < 10000) {
            return res.status(400).json({
                success: false,
                message: "Can't make a deposit less than NGN 1000",
            });
        }
        const form = { amount, email };
        const body = await new Promise((resolve, reject) => {
            initializePayment(form, (err, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
        const response = JSON.parse(body);
        console.log(response)
        const newDeposit = new Transaction({
            amount: amount / 100,
            user: email,
            reference: response.data.reference,
            type: 'deposit',
        });
        await newDeposit.save();
        res.json({ success: true, data: newDeposit });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal Server error' });
    }
};

exports.verifyDeposit = async (req, res) => {
    try {
        const { reference } = req.query;
        const transaction = await Transaction.findOne({ reference });
        const  email  = transaction.user;
        const user = await User.findOne({ email });
        console.log(user, email, reference, transaction)
        const body = await new Promise((resolve, reject) => {
            verifyPayment(reference, (err, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
        const response = JSON.parse(body);
        if (response.data.status === 'failed') {
            await transaction.updateOne(
                { $set: { status: 'failed', balance: user.balance } },
                { new: true }
            );
            return res.status(400).json({
                success: false,
                message: 'Error with the payment',
            });
        }
        const { amount } = response.data;
        const newBalance = user.balance + amount / 100;
        await Promise.all([
            transaction.updateOne(
                { $set: { status: 'success', balance: newBalance } },
                { new: true }
            ),
            pushNotification({
                email: email,
                message: `Deposited the amount of ${newBalance}`,
            }),
            await User.findOneAndUpdate({email: email}, {balance: newBalance, $push:{
                transactions: transaction
                }})
        ]);
        res.status(200).json({
            success: true,
            message: 'Deposited successfully',
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.investInRealEstate =async (req, res)=>{
    try {
        const user = req.user;
        const id = req.params.id;
        const currency = user.currency;
        const {invPeriod}  = req.body
        const realEstate = await RealEstate.findById(id);
        const balance = user.balance;
        if(user.isVerified == false){
            res.status(403).json({
                message: "Not allowed",
                status: "forbidden"
            })
        }else{
            if(currency === 'USD'){
                const newInvestment = {
                    user: req.user.id,
                    propertyId: id,
                    roi: realEstate.roi,
                    invPeriod: invPeriod,
                    status: 'owned',
                    currency: 'USD'
                }
                if(!(balance >= realEstate.amountInUsd)){
                    res.status(403).json({
                        message: "Account Balance is low!",
                        success: false,
                    })
                }else{
                    const investment = await RealEstateInvestment.create(newInvestment);
                    const newBalance = parseInt(balance) - realEstate.amountInUsd;
                    await User.findByIdAndUpdate(user.id, {
                        realEstateInvestment: investment,
                        balance: newBalance,
                        lastTransact: new Date(Date.now())
                    });
                    await realEstate.updateOne({
                        $inc: {
                            numberOfBuyers: 1
                        }
                    }, {
                        new: true
                    })
                    await sendMail({
                        email: user.email,
                        subject: "Acquired a portion!",
                        text: `You have successfully acquired ${realEstate.size} of ${realEstate.propertyName} at the rate of ${realEstate.amountInUsd}`
                    })
                    res.status(200).json({
                        success: true,
                        data: investment
                    })
                }   
            }else{
                const newInvestment = {
                    user: req.user.id,
                    propertyId: id,
                    roi: realEstate.roi,
                    invPeriod: invPeriod,
                    status: 'owned',
                    currency: 'NGN'
                }
                if(!(balance >= realEstate.amount)){
                    res.status(403).json({
                        message: "Account Balance is low!",
                        success: false,
                    })
                }else{
                    const investment = await RealEstateInvestment.create(newInvestment);
                    const newBalance = parseInt(balance) - realEstate.amount;
                    await User.findByIdAndUpdate(user.id, {
                        realEstateInvestment: investment,
                        balance: newBalance,
                        lastTransact: new Date(Date.now())
                    });
                    await realEstate.updateOne({
                        $inc: {
                            numberOfBuyers: 1
                        }
                    }, {
                        new: true
                    })
                    await sendMail({
                        email: user.email,
                        subject: "Acquired a portion!",
                        text: `You have successfully acquired ${realEstate.size} of ${realEstate.propertyName} at the rate of ${realEstate.amount}`
                    })
                    res.status(200).json({
                        success: true,
                        data: investment
                    })
                }
            }
        }
        } catch (error) {
        res.status(500).json({
            message: "Internal Server error"
        })
    }
};


exports.sellRealEstateInvestment = async(req, res)=>{
    try {
        const id = req.params.id
    } catch (error) {
        console.log(error);
    }
}