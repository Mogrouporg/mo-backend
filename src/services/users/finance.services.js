const request = require('request');
const { initializePayment, verifyPayment } = require('../../utils/payment.utils');
const { User } = require('../../models/users.model');
const { pushNotification } = require('../notif/notif.services');
const { Transaction } = require('../../models/transaction.model');
const { RealEstate } = require('../../models/realEstate.model');
const { RealEstateInvestment } = require('../../models/realEstateInvestments.model');
const {sendMail} = require("../../utils/mailer");
const {Transportation} = require("../../models/transportations.model");
const {TransInvest} = require("../../models/transInvestments.model");

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

    const response = await initializePayment(form);
    console.log(response.data.data);

    const newDeposit = new Transaction({
      amount: amount / 100,
      user: email,
      reference: response.data.data.reference,
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
    const email = transaction.user;
    const user = await User.findOne({ email });
    //console.log(user, email, reference, transaction);

    const response = await verifyPayment(reference);
    console.log(response.data.data);

    if (response.data.data.status === 'failed') {
      await transaction.updateOne(
        { $set: { status: 'failed', balance: user.balance } },
        { new: true }
      );
      return res.status(400).json({
        success: false,
        message: 'Error with the payment',
      });
    }

    if(response.data.data.status === 'abandoned'){
        await transaction.updateOne(
            { $set: { status: 'abandoned', balance: user.balance } },
            { new: true }
          );
          return res.status(400).json({
            success: false,
            message: 'Error with the payment',
          });
    }

    const { amount } = response.data.data;
    const newBalance = user.balance + amount / 100;
    const newNotif = {
        email: email,
        message: `Deposited the amount of ${newBalance}`,
      }

    await Promise.all([
      transaction.updateOne(
        { $set: { status: 'success', balance: newBalance } },
        { new: true }
      ),
      pushNotification(newNotif),
      User.findOneAndUpdate(
        { email: email },
        { balance: newBalance, $push: { transactions: transaction, notifications: newNotif } }
      ),
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
        if(user.isVerified === false){
            res.status(403).json({
                message: "Not allowed",
                status: "forbidden"
            })
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
        } catch (error) {
        res.status(500).json({
            message: "Internal Server error"
        })
    }
};


exports.sellRealEstateInvestment = async(req, res)=>{
    try {
        const id = req.params.id
        const investment = await RealEstateInvestment.findById(id);
        investment.updateOne({status: 'onSale'});
        await pushNotification({
            message: "Your investment is now on sale.  We will get you notified when it has been sold!😀",
            email: req.user.email
        })
        res.status(200).json({
            success: true,
            data: investment
        })
    } catch (error) {
        console.log(error);
    }
}

exports.investInTransport =async (req, res)=>{
    try {
        const user = req.user;
        const id = req.params.id;
        const currency = user.currency;
        const {invPeriod}  = req.body
        const transport = await Transportation.findById(id);
        const balance = user.balance;
        if(user.isVerified === false){
            res.status(403).json({
                message: "Not allowed",
                status: "forbidden"
            })
        }else{
            const newInvestment = {
                user: req.user.id,
                propertyId: id,
                roi: transport.roi,
                invPeriod: invPeriod,
                status: 'owned',
                currency: 'NGN'
            }
            if(!(balance >= transport.amount)){
                res.status(403).json({
                    message: "Account Balance is low!",
                    success: false,
                })
            }else{
                const investment = await TransInvest.create(newInvestment);
                const newBalance = parseInt(balance) - transport.amount;
                await User.findByIdAndUpdate(user.id, {
                    transportInvestment: investment,
                    balance: newBalance,
                    lastTransact: new Date(Date.now())
                });
                await transport.updateOne({
                    $inc: {
                        numberOfBuyers: 1
                    }
                }, {
                    new: true
                })
                await sendMail({
                    email: user.email,
                    subject: "Acquired a portion!",
                    text: `You have successfully acquired ${transport.transportType} of ${transport.transportName} at the rate of ${transport.amount}`
                })
                res.status(200).json({
                    success: true,
                    data: investment
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error"
        })
    }
};

exports.sellTransportInvestment = async(req, res)=>{
    try {
        const id = req.params.id
        const investment = await TransInvest.findById(id);
        investment.updateOne({status: 'onSale'});
        await pushNotification({
            message: "Your investment is now on sale.  We will get you notified when it has been sold!😀",
            email: req.user.email
        })
        res.status(200).json({
            success: true,
            data: investment
        })
    } catch (error) {
        console.log(error);
    }
}

