const { User } = require("../../models/users.model");
const { Admin } = require("../../models/admins.model");
const { Transaction } = require("../../models/transaction.model");
const { imageUpload } = require("../../utils/imageUpload.util");
const { RealEstate } = require("../../models/realEstate.model");
const {
  notifyAllUsers,
  startProcessing,
  stopProcessing,
} = require("../../utils/notifyAllUsers.util");
const { loanRequest } = require("../../models/loanRequests.model");
const { realEstateSchema, transportSchema } = require("../../models/validations/data");
const { Transportation } = require("../../models/transportations.model");

exports.getAllTransactions = async (req, res) => {
  try {
    const admin = req.admin;
    let transactions = await Transaction.find()
      .select("amount status -_id user")
      .sort({ createdAt: -1 });

    // Using Promise.all to handle asynchronous operations
    transactions = await Promise.all(
      transactions.map(async (transaction) => {
        const email = transaction.user;
        const user = await User.findOne({ email: email }).select(
          "firstName lastName _id email status"
        );
        transaction.user = JSON.stringify(user);
        return transaction;
      })
    );

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
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check authorization (example, you may have a different authorization logic)
    if (!req.admin || !req.admin.email) {
      return res.status(403).json({ message: "Permission denied!" });
    }

    const email = req.admin.email;
    const { name, amount, size, address, location, images, state, description } = value;

    // Image upload
    const urls = await imageUpload(images, "realEstate");

    // Fetch users
    const users = await User.find({ status: "active" }, "email");

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
      description: description,
      roi: 0.12*amount,
    });

    // Save real estate object
    await newRealEstate.save();

    // Notify users
    const emails = users.map((user) => user.email);
    console.log(emails);
    await notifyAllUsers(
      emails,
      "New Set of Real Estate Available!",
      `Get a portion of land for as low as ${amount} with the size of ${size} now!`
    );

    return res.status(201).json({
      success: true,
      data: newRealEstate,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.createTransportInvestment = async (req, res) => {
  try {
    const { error, value } = transportSchema.validate({
      ...req.body,
      images: req.files.images,
    });

    if (error) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (!req.admin || !req.admin.email) {
      return res.status(403).json({ message: "Permission denied!" });
    }

    const email = req.admin.email;

    const { name, amount, images, type, description } = value;

    const urls = await imageUpload(images, "transport");

    const users = await User.find({ status: "active" }, "email");

    const newTransport = new Transportation({
      user: email,
      transportName: name,
      amount: amount,
      image: urls,
      transportType: type,
      description: description,
      roi: 0.12*amount,
    });

    await newTransport.save();

    const emails = users.map((user) => user.email);

    await notifyAllUsers(
      emails,
      "New set of Transportation Investment available!",
      `Invest in this new Transportation investment for as low as ${amount} now!`
    );

    return res.status(201).json({
      success: true,
      data: newTransport,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getAllRealInvestments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number, default to 1
    const perPage = 10; // Number of items to display per page

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const totalInvestments = await RealEstate.countDocuments({ onSale: true });

    const investments = await RealEstate.find({ onSale: true })
      .select("propertyName image _id sizeInSqm amount state")
      .skip(startIndex)
      .limit(perPage);

    const pagination = {
      currentPage: page,
      itemsPerPage: perPage,
      totalItems: totalInvestments,
      totalPages: Math.ceil(totalInvestments / perPage),
    };

    return res.status(200).json({
      success: true,
      data: investments,
      pagination: pagination,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllTransInvestments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number, default to 1
    const perPage = 10; // Number of items to display per page

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const totalInvestments = await Transportation.countDocuments({ onSale: true });

    const investments = await Transportation.find({ onSale: true })
      .skip(startIndex)
      .limit(perPage);

    const pagination = {
      currentPage: page,
      itemsPerPage: perPage,
      totalItems: totalInvestments,
      totalPages: Math.ceil(totalInvestments / perPage),
    };

    return res.status(200).json({
      success: true,
      data: investments,
      pagination: pagination,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error",
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

    const { status } = req.body; // "approved" || "rejected"
    if (status === "approved") {
      loan.status = status;
      const user = await User.findById(loan.user);
      user.balance += parseInt(loan.amount);
      const transaction = new Transaction({
        amount: loan.amount,
        user: user.email,
        status: "success",
        balance: user.balance,
        type: "loan",
      });
      await loan.save();
      await transaction.save();
      await user.save();
      const message = `Your loan request of ${loan.amount} has been approved!`;
      await pushNotification({
        message: message,
        email: user.email,
      });
    }

    if (status === "rejected") {
      loan.status = status;
      await loan.save();
      const user = await User.findById(loan.user);
      const message = `Your loan request of ${loan.amount} has been rejected!`;
      await pushNotification({
        message: message,
        email: user.email,
      });
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
