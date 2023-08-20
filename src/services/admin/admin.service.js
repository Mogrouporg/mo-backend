const { User } = require("../../models/users.model");
const { Admin } = require("../../models/admins.model");
const { Transaction } = require("../../models/transaction.model");
const { imageUpload } = require("../../utils/imageUpload.util");
const { RealEstate } = require("../../models/realEstate.model");
const { notifyAllUsers, startProcessing, stopProcessing } = require("../../utils/notifyAllUsers.util");
const { loanRequest } = require("../../models/loanRequests.model");
const { realEstateSchema } = require("../../models/validations/data");
const { Transportation } = require("../../models/transportations.model");

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
    // Input validation
    const { error, value } = realEstateSchema.validate({
      ...req.body,
      images: req.files.images,
    });
    if (error) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Check authorization (example, you may have a different authorization logic)
    if (!req.admin || !req.admin.email) {
      return res.status(403).json({ message: 'Permission denied!' });
    }

    const email = req.admin.email;
    const { name, amount, size, address, location, images, state } = value;

    // Image upload
    const urls = await imageUpload(images, 'realEstate');

    // Fetch users
    const users = await User.find({status: "active"}, 'email');

    // Create real estate object
    const newRealEstate = new RealEstate({
      user: email,
      propertyName: name,
      amount: amount,
      sizeInSqm: size,
      address: address,
      image: urls,
      location: location,
      state: state,
    });

    // Save real estate object
    await newRealEstate.save();

    // Notify users
    const emails = users.map((user) => user.email);
    await notifyAllUsers(
      emails,
      'New Set of Real Estate Available!',
      `Get a portion of land for as low as ${amount} with the size of ${size} now!`,
      startProcessing,
      stopProcessing
    );

    return res.status(201).json({
      success: true,
      data: newRealEstate,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: 'Internal server error',
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

exports.getAllTransInvestments = async (req, res) => {
  try {
    const investments = await Transportation.find().select(
      "transportName image _id amount"
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
      "propertyName image _id sizeInSqm"
    );
    return res.status({
      success: true,
      data: investment,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getSingleTransInvestment = async (req, res) => {
    try {
      const _id = req.params.id;
      const investment = await Transportation.findById(_id).select(
        "transportName image _id amount"
      );
      return res.status({
        success: true,
        data: investment,
      });
    } catch (e) {
      console.log(e);
    }
}

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
