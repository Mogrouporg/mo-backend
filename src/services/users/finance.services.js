const { initializePayment, verifyPayment } = require('../../utils/payment.utils');
const { User } = require('../../models/users.model');
const { pushNotification } = require('../notif/notif.services');
const { Transaction } = require('../../models/transaction.model');
const { RealEstate } = require('../../models/realEstate.model');
const { RealEstateInvestment } = require('../../models/realEstateInvestments.model');
const {sendMail} = require("../../utils/mailer");
const {Transportation} = require("../../models/transportations.model");
const {TransInvest} = require("../../models/transInvestments.model");
const { loanRequest } = require('../../models/loanRequests.model');

exports.deposit = async (req, res) => {
  try {
    const { email } = req.user;
    let { amount } = req.body;
    amount *= 100;
    if (!amount || amount < 3950) {
      return  res.status(400).json({
        success: false,
        message: "Can't make a deposit less than NGN 3950",
      });
    }
    const form = { amount, email };

    const response = await initializePayment(form);
    console.log(response.data.data);

    const newDeposit = new Transaction({
      amount: amount / 100,
      user: email,
      reference: response.data.data.reference,
      type: 'Deposit',
    });
    await newDeposit.save();

    return res.json({ success: true, data: newDeposit, link: response.data.data.authorization_url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal Server error' });
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

    if (response.data.data.status === 'Failed') {
      await transaction.updateOne(
        { $set: { status: 'Failed', balance: user.balance } },
        { new: true }
      );
      return  res.status(400).json({
        success: false,
        message: 'Error with the payment',
      });
    }

    if(response.data.data.status === 'Abandoned'){
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
        { balance: newBalance, $push: { transactions: transaction.id} }
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Deposited successfully',
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.investInRealEstate =async (req, res)=>{
    try {
        const user = req.user;
        const id = req.params.id;
        const {invPeriod}  = req.body
        const realEstate = await RealEstate.findById(id);
        const balance = user.balance;
        if(user.isVerified === false){
            return res.status(403).json({
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
                    return res.status(403).json({
                        message: "Account Balance is low!",
                        success: false,
                    })
                }else{
                    const investment = await RealEstateInvestment.create(newInvestment);
                    const newBalance = parseInt(balance) - realEstate.amount;
                    await User.findByIdAndUpdate(user.id, {
                        $push: {
                            realEstateInvestment: investment
                        },
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
                    return res.status(200).json({
                        success: true,
                        data: investment
                    })
                }
        }
        } catch (error) {
        return res.status(500).json({
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
        return res.status(200).json({
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
        const {invPeriod}  = req.body
        const transport = await Transportation.findById(id);
        const balance = user.balance;
        if(user.isVerified === false){
            return res.status(403).json({
                message: "Not allowed",
                status: "forbidden"
            })
        }
            const newInvestment = {
                user: req.user.id,
                propertyId: id,
                roi: transport.roi,
                invPeriod: invPeriod,
                status: 'owned',
                currency: 'NGN'
            }
            if(!(balance >= transport.amount)){
                return res.status(403).json({
                    message: "Account Balance is low!",
                    success: false,
                })
            }else{
                const investment = await TransInvest.create(newInvestment);
                const newBalance = parseInt(balance) - transport.amount;
                await User.findByIdAndUpdate(user.id, {
                    $push: {
                        transportInvestment: investment
                    },
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
                return res.status(200).json({
                    success: true,
                    data: investment
                })
            }
    } catch (error) {
        return res.status(500).json({
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
        return res.status(200).json({
            success: true,
            data: investment
        })
    } catch (error) {
        console.log(error);
    }
}

exports.withdrawFunds = async (req, res) => {
    try {
        const user = req.user;
        const { amount } = req.body;
        const client = await User.findById(user._id)
        const reference = Math.random().toString().slice(2)
        if (parseInt(amount) < 1000 || parseInt(amount) > 5000000) {
            return  res.status(400).json({
                success: false,
                data: "Cannot withdraw less than NGN1000"
            })
        }
        if (parseInt(amount) > user.balance) {
            return  res.status(400).json({
                success: false,
                data: "Insufficient Balance"
            })
        }
        if ((parseInt(amount) + 500) >= user.balance) {
            return  res.status(400).json({
                success: false,
                data: "Cannot leave less than 500 in the account"
            })
        } else {
            const withdraw = {
                amount: amount,
                status: "pending",
                user: user._id,
                reference: reference,
                type: 'withdrawal',
                balance: parseInt(user.balance) - parseInt(amount)
            }
            const notification = {
                message: `You have successfully placed a withdrawal request of ${amount} to your bank account.`,
                email: user.email
            }
            const newWithdrawal = new Transaction(withdraw)
            await newWithdrawal.save();
            const notifications = await pushNotification(notification);
            await client.updateOne({
                balance: parseInt(user.balance) - parseInt(amount),
                $push: {
                    transactions: newWithdrawal,
                    notifications: notifications
                }
            });
            await sendMail({
                email: user.email,
                subject: "Withdrawal Request",
                text: `You have successfully placed a withdrawal request of ${amount} to your bank account.`
            });
            return  res.status(200).json({
                success: true,
                data: "Your withdrawal request has been placed."
            })
        }
    } catch (error) {
        console.log(error);
        return  res.status(500).json({
            success: false,
            data: "Internal Server Error"
        });
    }
}

exports.requestLoan = async (req, res)=>{
    const { id } = req.user;
    try {
        if(req.user.status === 'inactive'){
            return res.status(403).json({
                success: false,
                message: "Not allowed request for loan as you are inactive"
            })
        }
        const loanExist = await loanRequest.findOne({user: id, paid: false})
        if(loanExist){
            return res.status(403).json({
                success: false,
                message: "You have an unpaid loan"
            })
        }

        const balance = req.user.balance;
        const { amount } = req.body;
        if(parseInt(amount) > (0.3 * balance)){
            return res.status(403).json({
                success: false,
                message: "You cannot request for more than 30% of your balance"
            })
        }

        const newLoan = {
            user: id,
            loanAmount: amount,
            loanPeriod: req.body.loanPeriod,
            bankName: req.body.bankName,
            accountNumber: req.body.accountNumber,
            accountName: req.body.accountName,
            loanDesc: req.body.loanDesc
        }

        const loan = new loanRequest(newLoan);
        await loan.save();
        const user = await User.findById(id);
        const newNotif = {
            email: user.email,
            message: `You have successfully requested for a loan of ${amount}`
        }
        await pushNotification(newNotif);
        await user.updateOne({
            $push: {
                loanRequests: loan.id,
            },
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

exports.fetchLoanHistory = async (req, res)=>{
    try {
        const id = req.user.id;
        const transactions = await User.findById(id).select('transactions').populate('transactions');
        const loan = transactions.transactions.filter((transaction)=> transaction.type === 'Loan');
        return res.status(200).json({
            success: true,
            data: loan
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}