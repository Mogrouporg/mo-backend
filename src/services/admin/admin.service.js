const { User } = require("../../models/users.model");
const { Admin } = require("../../models/admins.model");
const { Transaction } = require("../../models/transaction.model");
const { imageUpload } = require("../../utils/imageUpload.util");
const { RealEstate } = require("../../models/realEstate.model");
const { notifyAllUsers } = require("../../utils/notifyAllUsers.util");
const { loanRequest } = require("../../models/loanRequests.model");

exports.getAllTransactions = async (req, res) => {
  try {
    const admin = req.admin;
    const transactions = await Transaction.find()
      .select("amount status -_id")
      .populate("user", "firstName lastName");
    return res.status(200).json({
      _id: admin.id,
      success: true,
      data: transactions,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const admin = req.admin;
    const users = await User.find().select(
      "firstName lastName balance status lastTransact"
    );
    return res.status(200).json({
      _id: admin.id,
      success: true,
      data: users,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const admin = req.admin;
    const id = req.params.userId;
    const user = await User.findById(id).select(
      "-password -token -resetPasswordToken"
    );
    return res.status(200).json({
      adminId: admin.id,
      success: true,
      data: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.createLandInvestment = async (req, res) => {
  try {
    const email = req.admin.email;
    const { name, amount, size, address, location } = req.body;
    const { images } = req.files;
    if (!name || !amount || !size || !address || !location) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    } else {
      const urls = await imageUpload(images, "realEstate");
      const users = await User.find({}, "email");
      const newRealEstate = new RealEstate({
        user: email,
        propertyName: name,
        amount: amount,
        sizeInSqm: size,
        address: address,
        image: urls,
        location: location,
      });
      await newRealEstate.save();
      const emails = users.map((user) => user.email);
      await notifyAllUsers(
        emails,
        "New Set of Real Estate Available!",
        `Get a portion of land for as low as ${amount} with the size of ${size} now!`
      );
      return res.status(201).json({
        success: true,
        data: newRealEstate,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getAllRealInvestments = async (req, res) => {
  try {
    const investments = await RealEstate.find().select(
      "propertyName image -_id sizeInSqm"
    );
    return res.status({
      success: true,
      data: investments,
    });
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      message: "Internal Server error",
    });
  }
};

exports.getSingleRealEstate = async (req, res) => {
  try {
    const _id = req.params.id;
    const investment = await RealEstate.findById(_id).select(
      "propertyName image -_id sizeInSqm"
    );
    return res.status({
      success: true,
      data: investment,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const id = req.params.id;
    const loan = await loanRequest.findById(id);
    if (!loan) {
      return res.status(404).json({
        message: "Loan request not found",
      });
    }

    const {status} = req.body // "approved" || "rejected"
    if(status === 'approved'){
        loan.status = status;
        const user = await User.findById(loan.user);
        user.balance += parseInt(loan.amount)
        const transaction = new Transaction({
            amount: loan.amount,
            user: user.email,
            status: 'success',
            balance: user.balance,
            type: 'loan'
        })
        await loan.save(); 
        await transaction.save()
        await user.save();
        const message = `Your loan request of ${loan.amount} has been approved!`
        await pushNotification({
            message: message,
            email: user.email
        })
    }

    if(status === 'rejected'){
        loan.status = status;
        await loan.save();
        const user = await User.findById(loan.user);
        const message = `Your loan request of ${loan.amount} has been rejected!`
        await pushNotification({
            message: message,
            email: user.email
        })
    }
    
    return res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
