const {User} = require("../../models/users.model");
const {sendMail} = require("../../utils/mailer");
const {Transaction} = require("../../models/transaction.model");
const {TransInvest} = require("../../models/transInvestments.model");
const {
  RealEstateInvestment,
} = require("../../models/realEstateInvestments.model");
const {imageUpload} = require("../../utils/imageUpload.util");
const {RealEstate} = require("../../models/realEstate.model");
const {Transportation} = require("../../models/transportations.model");
const {listBanks, banklookup} = require("../../utils/banklookup");
const argon2 = require("argon2");

const calculateAllMyDailyROI = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select("realEstateInvestment transportInvestment")
      .populate({
        path: "realEstateInvestment",
        model: "RealEstateInvestment",
      })
      .populate({
        path: "transportInvestment",
        model: "TransInvest",
      });

    const realEstateInvestment = user.realEstateInvestment;
    const transportInvestment = user.transportInvestment;
    console.log(realEstateInvestment);
    console.log(transportInvestment);

    const realEstateInvestmentROI = realEstateInvestment.map((investment) => {
      const {roi} = investment;
      return roi;
    });

    const transportInvestmentROI = transportInvestment.map((investment) => {
      const {roi} = investment;
      return roi;
    });

    const totalRealEstateInvestmentROI = realEstateInvestmentROI.reduce(
      (a, b) => a + b,
      0
    );
    const totalTransportInvestmentROI = transportInvestmentROI.reduce(
      (a, b) => a + b,
      0
    );
    const totalROI = totalRealEstateInvestmentROI + totalTransportInvestmentROI;

    return totalROI;
  } catch (error) {
    throw error;
  }
};

exports.myProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId, "-password -refreshTokenHash");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.editAccount = async (req, res) => {
  try {
    const id = req.user.id;
    const body = req.body;
    let updatedUser = null;
    if (Object.keys(body).length > 0) {
      updatedUser = await User.findByIdAndUpdate(id, body, {new: true});
    }

    if (!updatedUser) {
      return res.status(400).json({
        message: "No changes were provided for updating the user.",
      });
    }

    return res.status(200).json({
      message: "User updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.listBanks = async (req, res) => {
  try {
    const banks = await listBanks();
    return res.status(200).json({
      success: true,
      data: banks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAccountName = async (req, res) => {
  try {
    const {bankCode, accountNumber} = req.body;
    if (!bankCode || !accountNumber) {
      return res.status(400).json({
        message: "Please provide bank code and account number",
      });
    }
    const accountDetails = await banklookup(bankCode, accountNumber);
    return res.status(200).json({
      success: true,
      data: accountDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};




exports.addBankDetails = async (req, res) => {
  try {
    const user = req.user;
    const {bankName, accountName, accountNumber} = req.body;
    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }
    if (user.bankDetails.length == 3) {
      return res.status(401).json({
        message: "You cannot add more bank details."
      })
    }
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $push: {bankDetails: {bankName, accountName, accountNumber}},
      },
      {new: true}
    );
    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
exports.getMyTransactions = async (req, res) => {
  try {
    const _id = req.user._id;
    const myTransactions = await User.findById(_id)
      .select("transactions")
      .populate({
        path: "transactions",
        match: {status: {$nin: ["Abandoned"]}},
        options: {sort: {createdAt: -1}}
      })
      .populate({
        path: "transactions.investment",
        model: "investment"
      });

    return res.status(200).json({
      success: true,
      data: myTransactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
exports.getSingleRealEstate = async (req, res) => {
  try {
    const {id} = req.params;
    const investment = await RealEstate.findById(id);
    if (!investment) {
      return res.status(404).json({
        message: "Couldn't find the investment you are looking for."
      })
    }
    return res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getSingleTransportTation = async (req, res) => {
  try {
    const {id} = req.params;
    const investment = await Transportation.findById(id);
    if (!investment) {
      return res.status(404).json({
        message: "Couldn't find the investment you are looking for."
      })
    }
    return res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getMyInvestments = async (req, res) => {
  try {
    const _id = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const [myRealEstateInvestments, myTransportInvestments] = await Promise.all(
      [
        User.findById(_id)
          .select("realEstateInvestment")
          .populate({
            path: "realEstateInvestment",
            model: "RealEstateInvestment",
            options: {
              skip: startIndex,
              limit: perPage,
            },
          }),

        User.findById(_id)
          .select("transportInvestment")
          .populate({
            path: "transportInvestment",
            model: "TransInvest",
            options: {
              skip: startIndex,
              limit: perPage,
            },
          }),
      ]
    );

    const [totalRealEstateInvestments, totalTransportInvestments] =
      await Promise.all([
        User.findById(_id).select("realEstateInvestment"),
        User.findById(_id).select("transportInvestment"),
      ]);

    const pagination = {
      currentPage: page,
      itemsPerPage: perPage,
      totalRealEstateInvestments:
        totalRealEstateInvestments.realEstateInvestment.length,
      totalTransportInvestments:
        totalTransportInvestments.transportInvestment.length,
    };

    return res.status(200).json({
      success: true,
      data: {
        myRealEstateInvestments,
        myTransportInvestments,
      },
      pagination: pagination,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const {id} = req.user;
    const {file} = req.files;
    const url = await imageUpload(file, "avatars");
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {profile_url: url},
      {new: true}
    );
    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const {oldPassword, newPassword} = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }
    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await argon2.hash(newPassword);
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {password: hashedPassword},
      {new: true}
    );

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
