const {
  initializePayment,
  verifyPayment,
} = require("../../utils/payment.utils");
const { User } = require("../../models/users.model");
const { pushNotification } = require("../notif/notif.services");
const { Transaction } = require("../../models/transaction.model");
const { RealEstate } = require("../../models/realEstate.model");
const {
  RealEstateInvestment,
} = require("../../models/realEstateInvestments.model");
const { sendMail } = require("../../utils/mailer");
const { Transportation } = require("../../models/transportations.model");
const { TransInvest } = require("../../models/transInvestments.model");
const { loanRequest } = require("../../models/loanRequests.model");
const { Withdrawals } = require("../../models/withdrawalRequest.model");

exports.deposit = async (req, res) => {
  try {
    const { email } = req.user;
    let { amount } = req.body;
    amount *= 100;
    if (!amount || amount < 3950) {
      return res.status(400).json({
        success: false,
        message: "Can't make a deposit less than NGN 3950",
      });
    }
    const form = { amount, email };

    const response = await initializePayment(form);

    const newDeposit = new Transaction({
      amount: amount / 100,
      user: email,
      reference: response.data.data.reference,
      type: "Deposit",
    });
    await newDeposit.save();

    return res.json({
      success: true,
      data: newDeposit,
      link: response.data.data.authorization_url,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

exports.verifyDeposit = async (req, res) => {
  try {
    const { reference } = req.query;
    const transaction = await Transaction.findOne({ reference });
    const email = transaction.user;
    const user = await User.findOne({ email });

    const response = await verifyPayment(reference);

    if (response.data.data.status === "failed") {
      await transaction.updateOne(
        { $set: { status: "Failed", balance: user.balance } },
        { new: true }
      );
      return res.status(400).json({
        success: false,
        message: "Error with the payment",
      });
    }

    if (response.data.data.status === "abandoned") {
      await transaction.updateOne(
        { $set: { status: "Abandoned", balance: user.balance } },
        { new: true }
      );
      return res.status(400).json({
        success: false,
        message: "Error with the payment",
      });
    }

    const { amount } = response.data.data;
    const newBalance = user.balance + amount / 100;
    const newNotif = {
      email: email,
      message: `Deposited the amount of ${newBalance}`,
    };

    await Promise.all([
      transaction.updateOne(
        { $set: { status: "Success", balance: newBalance } },
        { new: true }
      ),
      pushNotification(newNotif),
      User.findOneAndUpdate(
        { email: email },
        { balance: newBalance, $push: { transactions: transaction.id } }
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "Deposited successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error", e });
  }
};

exports.investInRealEstate = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const { invPeriod } = req.body;

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

    const newInvestment = {
      user: req.user.id,
      propertyId: id,
      invPeriod: invPeriod,
      status: "owned",
      currency: "NGN",
      roi: realEstate.roi * parseInt(invPeriod), // Calculate ROI once
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
      console.log(transaction)
    await Promise.all([
      User.findByIdAndUpdate(user.id, {
        $push: {
          realEstateInvestment: investment.id,
          transactions: transaction.id,
        },
        $inc: { balance: -realEstate.amount },
        lastTransact: new Date(Date.now()),
      }),
      realEstate.updateOne({ $inc: { numberOfBuyers: 1 } }),
      sendMail({
        email: user.email,
        subject: "Acquired a portion!",
        text: `You have successfully acquired ${realEstate.size} of ${realEstate.propertyName} at the rate of ${realEstate.amount}`,
      }),
    ]);

    await investment.updateOne({ transaction: transaction.id })
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
    investment.updateOne({ status: "onSale" });
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
    const { invPeriod, plan } = req.body;

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

    const totalRoi = 0.48 * transport.amount * invPeriod/12;

    // Create a new investment
    const newInvestment = {
      userId: user.id,
      propertyId: id,
      roi: transport.roi,
      invPeriod: invPeriod,
      status: "owned",
      currency: "NGN",
      roi: totalRoi,
      plan: plan
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

    // Update user and transport in a single query
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $push: {
          transportInvestment: investment.id,
          transactions: transaction.id,
        },
        $inc: {
          balance: -transport.amount,
        },
        lastTransact: new Date(Date.now()),
      },
      { new: true } // Get the updated user object
    );
    // Increment the number of buyers for the transport
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
    await investment.updateOne({ transaction: transaction.id });

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
    investment.updateOne({ status: "onSale" });
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
    const { amount, bankDetails } = req.body;
    const reference = Math.random().toString().slice(2);

    // Check for invalid withdrawal requests
    if (!bankDetails) {
      return res.status(400).json({
        success: false,
        data: "Please add your bank details and amount",
      });
    }
    if (parseInt(amount) < 1000 || parseInt(amount) > 5000000) {
      return res.status(400).json({
        success: false,
        data: "Cannot withdraw less than NGN1000 or more than NGN5000000",
      });
    }
    if (parseInt(amount) + 500 >= user.totalRoi) {
      return res.status(400).json({
        success: false,
        data: "Cannot leave less than 500 in the account",
      });
    }

    // Check for pending loans
    const loan = await loanRequest.findOne({ user: user.id, paid: false });
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
        amount: amount,
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
      balance: parseInt(user.totalRoi) - parseInt(amount),
      $push: {
        transactions: transaction.id,
        notifications: notification,
      },
    });

    // Update the withdrawal request with the transaction ID
    await withdrawal.updateOne({ transaction: transaction.id });

    // Send email notification
    await sendMail({
      email: user.email,
      subject: "Withdrawal Request",
      text: `You have successfully placed a withdrawal request of ${amount} to your bank account.`,
    });

    return res.status(200).json({
      success: true,
      data: "Your withdrawal request has been placed.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      data: "Internal Server Error",
    });
  }
};

exports.requestLoan = async (req, res) => {
  try {
    const { id } = req.user;
    const user = req.user;

    // Check user status
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Not allowed to request a loan as you are inactive",
      });
    }

    // Check if the user has an unpaid loan
    const loanExist = await loanRequest.findOne({ user: id, paid: false });
    if (loanExist) {
      return res.status(403).json({
        success: false,
        message: "You have an unpaid loan",
      });
    }

    const { amount, loanPeriod, loanDesc, bankDetails } = req.body;
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
      await loan.updateOne({ transaction: transaction.id }),
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
          path: "transportId",
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
          { "realEstateInvestment._id": id },
          { "transportInvestment._id": id },
        ],
      },
    });
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    const foundInvestment =
      investment.realEstateInvestment || investment.transportInvestment;

    res.status(200).json({ success: true, investment: foundInvestment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
