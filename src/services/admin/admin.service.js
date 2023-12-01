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
const { Withdrawals } = require("../../models/withdrawalRequest.model");
const { pushNotification } = require("../notif/notif.services");
const Investment = require("../../models/investment");
const { sendNewPropertyMail, sendNewTransportMail } = require("../../utils/mailTemplates/newProperty.mail");

exports.getAllTransactions = async (req, res) => {
  try {
    const admin = req.admin;
    const { status, type } = req.query; // Extract the filter parameters from the query string

    // Build the query object based on the presence of filter parameters
    let query = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    let transactions = await Transaction.find(query) // Use the query object in the find method
      .select("amount status -_id user type status")
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
      "-password -token -resetPasswordToken"
    ).populate("transactions", "amount status -_id user type status").populate('realEstateInvestment', "propertyName image _id sizeInSqm amount state")
    .populate('transportInvestment', "transportName image _id amount transportType description")
    return res.status(200).json({
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

exports.searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    let searchFilters = {};

    if (searchQuery) {
      searchFilters.email = { $regex: new RegExp(searchQuery, 'i') }; // Case-insensitive search
    }

    if (req.query.status) {
      searchFilters.status = req.query.status;
    }

    const startIndex = (page - 1) * perPage;

    const totalResults = await User.countDocuments(searchFilters).exec();
    const results = await User.find(searchFilters)
      .select("-password -token -resetPasswordToken")
      .skip(startIndex)
      .limit(perPage);

    // Pagination
    const pagination = {
      currentPage: page,
      itemsPerPage: perPage,
      totalItems: totalResults,
      totalPages: Math.ceil(totalResults / perPage),
    };

    res.status(200).json({
      success: true,
      data: results,
      pagination: pagination,
    });

  } catch (error) {
    // Error handling
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }

}

exports.getSingleUser = async (req, res) => {
  try {
    const admin = req.admin;
    const id = req.params.userId;
    const user = await User.findById(id).select(
      "-password -token -resetPasswordToken"
    ).populate("transactions", "amount status -_id user type status").populate('realEstateInvestment', "propertyName image _id sizeInSqm amount state")
    .populate('transportInvestment', "transportName image _id amount transportType description")
    return res.status(200).json({
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
      roi: 0.35*amount,
    });

    // Save real estate object
    await newRealEstate.save();
    const message = sendNewPropertyMail({image: urls[0], name, size, location, amount})

    // Notify users
    const emails = users.map((user) => user.email);
    console.log(emails);
    await notifyAllUsers(
      emails,
      "New Set of Real Estate Available!",
      message
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
    });

    await newTransport.save();

    const emails = users.map((user) => user.email);
    const message = sendNewTransportMail({image: urls[0], name, amount})

    await notifyAllUsers(
      emails,
      "New set of Transportation Investment available!",
      message
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

exports.getAllRealEstates = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; 
      const perPage = 10;
      const stateFilter = req.query.state ? { onSale: true, state: req.query.state } : { onSale: true };
      
      const startIndex = (page - 1) * perPage;
      const totalInvestments = await RealEstate.countDocuments(stateFilter).exec();

      const investments = await RealEstate.find(stateFilter)
          .select("propertyName image _id sizeInSqm amount state")
          .skip(startIndex)
          .limit(perPage).sort({ createdAt: -1 });

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
 exports.searchRealEstates= async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    let searchFilters = { onSale: true };

    if (searchQuery) {
      searchFilters.propertyName = { $regex: new RegExp(searchQuery, 'i') }; // Case-insensitive search
    }

    if (req.query.state) {
      searchFilters.state = req.query.state;
    }

    const startIndex = (page - 1) * perPage;

    const totalResults = await RealEstate.countDocuments(searchFilters).exec();
    const results = await RealEstate.find(searchFilters)
      .select("propertyName image _id sizeInSqm amount state")
      .skip(startIndex)
      .limit(perPage);

    // Pagination
    const pagination = {
      currentPage: page,
      itemsPerPage: perPage,
      totalItems: totalResults,
      totalPages: Math.ceil(totalResults / perPage),
    };

    res.status(200).json({
      success: true,
      data: results,
      pagination: pagination,
    });

  } catch (error) {
    // Error handling
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}


exports.getAllTransports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number, default to 1
    const perPage = 10; // Number of items to display per page

    const startIndex = (page - 1) * perPage;

    const totalInvestments = await Transportation.countDocuments({ onSale: true }).exec();

    const investments = await Transportation.find({ onSale: true })
      .skip(startIndex)
      .limit(perPage).sort({ createdAt: -1 });

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


exports.searchTransports = async (req, res)=>{
  try {
    const searchQuery = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    let searchFilters = { onSale: true };

    if (searchQuery) {
      searchFilters.transportName = { $regex: new RegExp(searchQuery, 'i') }; // Case-insensitive search
    }

    if (req.query.type) {
      searchFilters.transportType = req.query.type;
    }

    const startIndex = (page - 1) * perPage;

    const totalResults = await Transportation.countDocuments(searchFilters).exec();
    const results = await Transportation.find(searchFilters)
      .skip(startIndex)
      .limit(perPage);

    // Pagination
    const pagination = {
      currentPage: page,
      itemsPerPage: perPage,
      totalItems: totalResults,
      totalPages: Math.ceil(totalResults / perPage),
    };

    res.status(200).json({
      success: true,
      data: results,
      pagination: pagination,
    });

  } catch (error) {
    // Error handling
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

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

exports.getSingleTransport = async (req, res) => {
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

    if (status === "Approved" || status === "Declined") {
      loan.status = status;
      await loan.save();

      const user = await User.findById(loan.user);
      const transaction = await Transaction.findById(loan.transaction);

      if (status === "Approved") {
        await transaction.updateOne({ status: "Success" });
        const message = `Your loan request of ${loan.amount} has been approved!`;
        await pushNotification({
          message: message,
          email: user.email,
        });
      } else if (status === "Declined") {
        await transaction.updateOne({ status: "Failed" });
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
    } else {
      return res.status(400).json({
        message: "Invalid status",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};


exports.getAllLoans = async (req, res) => {
  try {
    let query = {};
    if (req.query.category) {
      switch (req.query.category.toLowerCase()) {
        case "approved":
          query.status = "Approved";
          break;
        case "pending":
          query.status = "Pending";
          break;
        case "declined":
          query.status = "Declined";
          break;
        case "all":
          query = {};
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid category. Valid categories are 'approved', 'pending', or 'declined'."
          });
      }
    }

    const loans = await loanRequest.find(query).populate("user").sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
}

exports.getSingleLoan = async (req, res) => {
  try {
    const id = req.params.id;
    const loan = await loanRequest.findById(id).populate("user");
    return res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
}

exports.getAllWithdrawalRequests = async (req, res) => {
  try {
    let query = {};

    // Check if a category filter is provided in the query parameters
    if (req.query.category) {
      switch (req.query.category.toLowerCase()) {
        case "approved":
          query.status = "Approved";
          break;
        case "pending":
          query.status = "Pending";
          break;
        case "declined":
          query.status = "Declined";
          break;
        default:
          // Handle invalid category by returning an error response
          return res.status(400).json({
            success: false,
            message: "Invalid category. Valid categories are 'approved', 'pending', or 'declined'."
          });
      }
    }

    const requests = await Withdrawals.find(query).populate("user");
    
    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
}


exports.getSingleWithdrawalRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const request = await Withdrawals.findById(id).populate("user");
    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
}

exports.approveWithdrawal = async (req, res) => {
  try {
    const id = req.params.id;
    const request = await Withdrawals.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Withdrawal request not found",
      });
    }

    const { status } = req.body;

    if (status === "Approved" || status === "Declined") {
      request.status = status;
      await request.save();

      const user = await User.findById(request.user);
      const transaction = await Transaction.findById(request.transaction);

      if (status === "Approved") {
        await transaction.updateOne({ status: "Success" });
        await user.updateOne({ $inc:{ totalRoi: -request.amount}})
        const message = `Your withdrawal request of ${request.amount} has been approved!`;
        await pushNotification({
          message: message,
          email: user.email,
        });
      } else if (status === "Declined") {
        await transaction.updateOne({ status: "Decline" });
        const message = `Your withdrawal request of ${request.amount} has been rejected!`;
        await pushNotification({
          message: message,
          email: user.email,
        });
      }

      return res.status(200).json({
        success: true,
        data: request,
      });
    } else {
      return res.status(400).json({
        message: "Invalid status",
      });
    }
  }catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
}


exports.banUser = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.banStatus === "banned") {
      return res.status(400).json({
        message: "User already banned",
      });
    }
    await user.updateOne({ banStatus: 'banned'}, { new: true });
    return res.status(200).json({
      success: true,
      data: user,
    });
}

exports.activateUser = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.banStatus === "active") {
      return res.status(400).json({
        message: "User already active",
      });
    }
    await user.updateOne({ banStatus: "active" }, { new: true });
    return res.status(200).json({
      success: true,
      data: user,
    });
}

exports.totalCounts = async (req, res)=>{
  try{
    const count = await User.count({ status: 'inactive'})
    const totalBannedUsers = await User.count({ banStatus: 'banned'});
    const properties = await Investment.count();
    const availableProperties = await RealEstate.count({ onSale: true });
    const availableTransport = await Transportation.count({ onSale: true });



    return res.status(200).json({
      success: true,
      inactiveUsers: count,
      bannedUsers: totalBannedUsers,
      totalBought: properties,
      availableProperties: availableProperties,
      availableTransport: availableTransport
    })
  }catch(e){
    console.log(e)
    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}