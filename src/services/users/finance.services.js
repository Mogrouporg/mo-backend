const request = require('request');
const { initializePayment, verifyPayment } = require('../../utils/payment.utils')(request);
const { User } = require('../../models/users.model');
const { pushNotification } = require('../notif/notif.services')
const { Transaction } = require('../../models/transaction.model');


exports.deposit = async (req, res)=>{
    try {
        const email = req.user.email;
        const amount = req.body.amount *= 100;
        const form = { amount, email };
        if(!amount || amount < 10000){
            res.status(400).json({
                success: false,
                message: "Can't make a deposit less than NGN 1000"
            })
        }else{
            await initializePayment(form, async (err, body)=>{
                console.log(body)
                if(err){
                    res.status(400).json({
                        message: "An error occurred while processing your request"
                    })
                }else{
                    const response = JSON.parse(body);
                    const newDeposit = new Transaction({
                        amount:amount,
                        user: email,
                        reference: response.data.reference,
                        type: 'deposit'
                    });

                    await newDeposit.save();
                }
            })
        }
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
};

exports.verifyDeposit = async(req, res)=>{
    try {
        const reference = req.query.reference;
        const transaction = await Transaction.findOne({reference: reference});
        const email = transaction.user
        const user = await User.findOne({ email: email });
        await verifyPayment(reference, async (err, body)=>{
            console.log(body, user.balance);
            if(err){
                await transaction.updateOne({ status: 'failed', balance: user.balance}, {new : true});
            }else{
                let response = JSON.parse(body);
                if(response.data.status === 'failed'){
                    await transaction.updateOne({ status: 'failed', balance: user.balance}, {new : true});
                    res.status(400).json({
                        success: false,
                        message: "Error with the payment"
                    })
                }else{
                    const { amount } = response.data;
                    const newBalance = user.balance + amount/100;
                    await transaction.updateOne({ status: 'success', balance: newBalance}, { new: true});
                    await pushNotification({
                        email: email,
                        message: `Deposited the amount of ${newBalance}`
                    })
                    await user.updateOne({
                        balance: newBalance
                    })
                    res.status(200).json({
                        success: false,
                        message: "Deposited successfully"
                    })
                }
            }
        })
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

