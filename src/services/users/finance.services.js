const {
  initializePayment,
  verifyPayment,
  initializePaymentTest,
  verifyPaymentTest,
} = require("../../utils/payment.utils");
const {User} = require("../../models/users.model");
const {pushNotification} = require("../notif/notif.services");
const {Transaction} = require("../../models/transaction.model");
const {RealEstate} = require("../../models/realEstate.model");
const {
  RealEstateInvestment,
} = require("../../models/realEstateInvestments.model");
const {sendMail} = require("../../utils/mailer");
const {Transportation} = require("../../models/transportations.model");
const {TransInvest} = require("../../models/transInvestments.model");
const {loanRequest} = require("../../models/loanRequests.model");
const {Withdrawals} = require("../../models/withdrawalRequest.model");
const {notifyAdmin} = require("../../utils/notifyAllUsers.util");
const {House} = require("../../models/house.model");
const {HouseInvestment} = require("../../models/houseInvestment.model");

const processedRequests = new Set();

exports.deposit = async (req, res) => {
  try {
    const {email} = req.user;
    let {amount} = req.body;
    amount *= 100;
    if (!amount || amount < 3950) {
      return res.status(400).json({
        success: false,
        message: "Can't make a deposit less than NGN 3950",
      });
    }
    let response;
    const form = {amount, email};
    if (req.body.metadata === 'test') {
      response = await initializePaymentTest(form);
    } else {
      response = await initializePayment(form);
    }

    const newDeposit = new Transaction({
      amount: amount / 100,
      user: email,
      reference: response.data.data.reference,
      type: "Deposit",
      status: "Pending",
    });
    await newDeposit.save();

    return res.json({
      success: true,
      data: newDeposit,
      link: response.data.data.authorization_url,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({message: "Internal Server error"});
  }
};

exports.verifyDeposit = async (req, res) => {
  try {
    const {reference} = req.query;
    const transaction = await Transaction.findOne({reference});
    const email = transaction.user;
    const user = await User.findOne({email});

    if (processedRequests.has(reference)) {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    processedRequests.add(reference);
    let response;
    if (req.body.metadata === 'test') {
      response = await verifyPayment(reference)
    } else {
      response = await verifyPayment(reference)
    }


    if (response.data.data.status === "failed") {
      await transaction.updateOne(
        {$set: {status: "Failed", balance: user.balance}},
        {new: true}
      );
      return res.status(400).json({
        success: false,
        message: "Error with the payment",
      });
    }

    if (response.data.data.status === "abandoned") {
      await transaction.updateOne(
        {$set: {status: "Abandoned", balance: user.balance}},
        {new: true}
      );
      return res.status(400).json({
        success: false,
        message: "Error with the payment",
      });
    }

    if (response.data.data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Error with the payment",
      });
    }

    const {amount} = response.data.data;
    const newBalance = user.balance + amount / 100;
    const newNotif = {
      email: email,
      message: `Deposited the amount of ${newBalance}`,
    };

    await Promise.all([
      transaction.updateOne(
        {$set: {status: "Success", balance: newBalance}},
        {new: true}
      ),
      pushNotification(newNotif),
      User.findOneAndUpdate(
        {email: email},
        {balance: newBalance, $push: {transactions: transaction.id}}
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "Deposited successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({message: "Internal server error", e});
  }
};

exports.investInRealEstate = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const {invPeriod} = req.body;

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Not allowed",
        status: "forbidden",
      });
    }

    const realEstate = await RealEstate.findById(id);
    const balance = user.balance;

    if (balance < realEstate.amount) {
      return res.status(403).json({
        message: "Account Balance is low!",
        success: false,
      });
    }

    const amount = realEstate.amount;

    const newInvestment = {
      user: req.user.id,
      propertyId: id,
      invPeriod: invPeriod,
      status: "owned",
      currency: "NGN",
      roi: realEstate.roi * (parseInt(invPeriod) / 12), // Calculate ROI once
      amountInvested: realEstate.amount
    };

    const investment = new RealEstateInvestment(newInvestment)
    await investment.save()
    const transaction = new Transaction({
      amount: realEstate.amount.toString(),
      user: user.email,
      type: "Investment",
      reference: Math.random().toString().slice(2),
      balance: user.balance - realEstate.amount,
      status: "Success",
      investmentId: investment.id,
      investment: "RealEstateInvestment",
    })
    await transaction.save()
    const totalRoi = amount + (realEstate.roi * (parseInt(invPeriod) / 12));
    await Promise.all([
      User.findByIdAndUpdate(user.id, {
        $push: {
          realEstateInvestment: investment.id,
          transactions: transaction.id,
        },
        $inc: {balance: -realEstate.amount, totalInvestment: realEstate.amount, totalRoi: totalRoi},
        lastTransact: new Date(Date.now()),
      }),
      realEstate.updateOne({$inc: {numberOfBuyers: 1}}),
      sendMail({
        email: user.email,
        subject: "Acquired a portion!",
        html: `You have successfully acquired ${realEstate.size} of ${realEstate.propertyName} at the rate of ${realEstate.amount}`,
      }),
    ]);

    await investment.updateOne({transaction: transaction.id, amountInvested: realEstate.amount})
    return res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.sellRealEstateInvestment = async (req, res) => {
  try {
    const id = req.params.id;
    const investment = await RealEstateInvestment.findById(id);
    const data = req.user;
    const user = await User.findById(data.id);

    investment.updateOne({status: "onSale"});
    user.updateOne({
      $inc: {
        //TODO: Add the amount to the user's balance
      }
    })
    await pushNotification({
      message:
        "Your investment is now on sale.  We will get you notified when it has been sold!😀",
      email: req.user.email,
    });
    return res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.investInTransport = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const {invPeriod, plan} = req.body;

    // Basic request validation 
    if (!invPeriod || invPeriod <= 0) {
      return res.status(400).json({
        message: "Invalid invPeriod",
      });
    }

    if (!plan || plan <= 0) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    const transport = await Transportation.findById(id);

    // Check if the transportation is found
    if (!transport) {
      return res.status(404).json({
        message: "Transportation not found",
      });
    }

    // Check user verification status
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Not allowed",
        status: "forbidden",
      });
    }


    const balance = user.balance;

    // Check if the balance is sufficient
    if (balance < transport.amount) {
      return res.status(403).json({
        message: "Account Balance is low!",
        success: false,
      });
    }

    const totalRoi = 0.36 * transport.amount * invPeriod / 12;

    // Create a new investment
    const newInvestment = {
      userId: user.id,
      propertyId: id,
      roi: transport.roi,
      invPeriod: invPeriod,
      status: "owned",
      currency: "NGN",
      roi: totalRoi,
      plan: plan,
      amountInvested: transport.amount,
    };

    const [investment, transaction] = await Promise.all([
      TransInvest.create(newInvestment),
      Transaction.create({
        amount: transport.amount,
        user: user.email,
        type: "Investment",
        reference: Math.random().toString().slice(2),
        balance: user.balance - transport.amount,
        status: "Success",
        investmentId: id,
        investment: "TransInvest",
      }),
    ]);

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $push: {
          transportInvestment: investment.id,
          transactions: transaction.id,
        },
        $inc: {
          balance: -transport.amount,
          totalInvestment: transport.amount,
          totalRoi: totalRoi,
        },
        lastTransact: new Date(Date.now()),
      },
      {new: true} // Get the updated user object
    );
    await transport.updateOne(
      {
        $inc: {
          numberOfBuyers: 1,
        },
      },
      {
        new: true,
      }
    );

    // Send email notification
    await sendMail({
      email: user.email,
      subject: "Acquired a portion!",
      text: `You have successfully acquired ${transport.transportType} of ${transport.transportName} at the rate of ${transport.amount}`,
    });

    // Update the investment with the transaction ID
    await investment.updateOne({transaction: transaction.id, amountInvested: transport.amount});

    return res.status(200).json({
      success: true,
      data: investment,
      user: updatedUser, // Include the updated user object in the response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.sellTransportInvestment = async (req, res) => {
  try {
    const id = req.params.id;
    const investment = await TransInvest.findById(id);
    investment.updateOne({status: "onSale"});
    await pushNotification({
      message:
        "Your investment is now on sale.  We will get you notified when it has been sold!😀",
      email: req.user.email,
    });
    return res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.withdrawFunds = async (req, res) => {
  try {
    const user = req.user;
    const {amount, bankDetails} = req.body;
    const reference = Math.random().toString().slice(2);

    // Check for invalid withdrawal requests
    if (!bankDetails) {
      return res.status(400).json({
        success: false,
        message: "Please add your bank details and amount",
      });
    }

    // Check for pending loans
    const loan = await loanRequest.findOne({user: user.id, paid: false});
    if (loan) {
      return res.status(400).json({
        success: false,
        message: "You have an unpaid loan",
      });
    }

    // Check for pending withdrawals
    const formerWithdrawal = await Withdrawals.findOne({
      user: user.id,
      status: "Pending",
    });
    if (formerWithdrawal) {
      return res.status(403).json({
        success: false,
        message: "You have a pending withdrawal request",
      });
    }

    // Create withdrawal transaction and notification concurrently
    const [transaction, withdrawal, notification] = await Promise.all([
      Transaction.create({
        amount: amount,
        user: user.id,
        status: "Pending",
        type: "Withdrawal",
        reference: reference,
        balance: parseInt(user.totalRoi) - parseInt(amount),
      }),
      Withdrawals.create({
        user: user.id,
        amount: parseInt(amount),
        bankDetails: bankDetails,
        status: "Pending",
      }),
      pushNotification({
        message: `You have successfully placed a withdrawal request of ${amount} to your bank account.`,
        email: user.email,
      }),
    ]);

    // Update user's balance and push transactions and notifications
    await user.updateOne({
      $push: {
        transactions: transaction.id,
        notifications: notification,
      },
    });

    // Update the withdrawal request with the transaction ID
    await withdrawal.updateOne({transaction: transaction.id});

    // Send email notification
    await sendMail({
      email: user.email,
      subject: "Withdrawal Request",
      html: `You have successfully placed a withdrawal request of ${amount} to your bank account.`,
    });
    await notifyAdmin("Withdrawal Request", `A withdrawal request of ${amount} has been placed by ${user.email}`)

    return res.status(200).json({
      success: true,
      message: "Your withdrawal request has been placed.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.requestLoan = async (req, res) => {
  try {
    const {id} = req.user;
    const user = req.user;

    // Check user status
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Not allowed to request a loan as you are inactive",
      });
    }

    // Check if the user has an unpaid loan
    const loanExist = await loanRequest.findOne({user: id, paid: false});
    if (loanExist) {
      return res.status(403).json({
        success: false,
        message: "You have an unpaid loan",
      });
    }

    const {amount, loanPeriod, loanDesc, bankDetails} = req.body;
    const balance = user.totalRoi;

    // Check if the user has added bank details
    if (!user.bankDetails || user.bankDetails.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You have not added your bank details",
      });
    }

    // Check if the requested amount exceeds the limit
    const maxLoanAmount = 0.3 * balance;
    if (parseInt(amount) > maxLoanAmount) {
      return res.status(403).json({
        success: false,
        message: `You cannot request for more than 30% of your balance (Limit: ${maxLoanAmount})`,
      });
    }

    if (amount < 30000) {
      return res.status(403).json({
        message: "You cannot borrow less than NGN 30000",
      });
    }

    const newLoan = {
      user: id,
      loanAmount: amount,
      loanPeriod,
      loanDesc,
      bankDetails,
    };

    const loan = new loanRequest(newLoan);
    await loan.save();

    const newNotif = await pushNotification({
      email: user.email,
      message: `You have successfully requested for a loan of ${amount}`,
    });

    const reference = Math.random().toString().slice(2);
    const transaction = new Transaction({
      amount,
      user: user.email,
      type: "Loan",
      reference,
      balance: user.balance,
      status: "Pending",
    });

    await Promise.all([
      transaction.save(),
      user.updateOne({
        $push: {
          loanRequests: loan.id,
          notifications: newNotif.id,
          transactions: transaction.id,
        },
      }),
      await loan.updateOne({transaction: transaction.id}),
    ]);

    return res.status(200).json({
      success: true,
      message: "Loan request successfully created",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.fetchLoanHistory = async (req, res) => {
  try {
    const id = req.user.id;
    const transactions = await User.findById(id)
      .select("transactions")
      .populate("transactions");
    const loan = transactions.transactions.filter(
      (transaction) => transaction.type === "Loan"
    );
    return res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAllInvestment = async (req, res) => {
  try {
    const user = req.user;
    const allInvestments = await User.findById(user.id)
      .select("realEstateInvestment transportInvestment")
      .populate({
        path: "realEstateInvestment",
        model: "RealEstateInvestment",
        populate: {
          path: "propertyId",
          model: "RealEstate",
        },
      })
      .populate({
        path: "transportInvestment",
        model: "TransInvest",
        populate: {
          path: "propertyId",
          model: "Transportation",
        },
      })
      .lean(); // Use the lean method to get plain JavaScript objects.

    // Combine realEstateInvestment and transportInvestment arrays into a single array
    const combinedInvestments = [
      ...(allInvestments.realEstateInvestment || []),
      ...(allInvestments.transportInvestment || []),
    ];

    // Rename the "transportId" property to "propertyId" for each investment
    const renamedInvestments = combinedInvestments.map((investment) => {
      if (investment.transportId) {
        investment.transportId.propertyName = investment.transportId.transportName;
        // delete investment.transportId.transportName;
        investment.propertyId = investment.transportId;
        delete investment.transportId;
      }
      return investment;
    });

    return res.status(200).json({
      success: true,
      data: renamedInvestments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.getInvestment = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const investment = await User.findById(user.id).populate({
      path: "realEstateInvestment transportInvestment",
      model: "RealEstateInvestment TransInvest",
      match: {
        $or: [
          {"realEstateInvestment._id": id},
          {"transportInvestment._id": id},
        ],
      },
    });
    if (!investment) {
      return res.status(404).json({message: "Investment not found"});
    }
    const foundInvestment =
      investment.realEstateInvestment || investment.transportInvestment;

    return res.status(200).json({success: true, investment: foundInvestment});
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/** 
  *The logic for this function:
  * @Param id: house Id
  * @body amount: amount planning to be invested
  * @user user details
  *
  * fetches the house details
  * creates a new Investment model
  * calculate the roi
  * ??Period explanation and how it will affect the investment
  * if user is in the house investment before, do not include in the existing investors else, add to the user array
  * 
  * */


exports.investInHousing = async (req, res) => {
  const user = req.user;
  const {id} = req.params;
  const {amount, invPeriod} = req.body;

  try {
    const house = await House.findById(id);
    const data = await User.findById(user.id)
    if (!house) {
      return res.status(404).json({message: "House not found"});
    }
    if (house.funded >= house.target) {
      return res.status(404).json({message: "House already funded"});
    }
    const balance = user.balance;
    if (amount > balance) {
      return res.status(404).json({message: "Insufficient balance"});
    }

    const newInvestment = new HouseInvestment({
      user: user.id,
      house: house.id,
      amount,
      roi: amount * (house.roiPercentage / 100),
      invPeriod,
    });
    await newInvestment.save();
    if (!house.users.includes(user.id)) {
      house.users.push(user.id);
      await house.save();
    }

    await Promise.all([
      newInvestment.save(),
      house.updateOne({$inc: {funded: amount}}),
      data.updateOne({$inc: {balance: -amount}, $push: {investments: newInvestment.id}}, {new: true}),
    ]);

    return res.status(200).json({success: true, message: "Investment successful"});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
