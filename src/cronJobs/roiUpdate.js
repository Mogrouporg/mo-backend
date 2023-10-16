const cron = require("node-cron");
const {
  RealEstateInvestment,
} = require("../models/realEstateInvestments.model");
const { TransInvest } = require("../models/transInvestments.model");
const { User } = require("../models/users.model");

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const updateInvestmentsRoi = async (InvestmentModel, modelName) => {
  try {
    console.log(`Cron started for ${modelName}`);

    const investments = await InvestmentModel.find({ status: "owned" });

    const currentYear = new Date().getFullYear();
    const divisor = isLeapYear(currentYear) ? 366 : 365;

    const updates = investments.map((investment) => ({
      updateOne: {
        filter: { _id: investment._id },
        update: { $inc: { currentRoi: investment.roi / divisor } },
      },
    }));

    const result = await InvestmentModel.bulkWrite(updates);

    console.log(
      `Updated ROI for ${result.nModified} ${modelName} investments.`
    );
  } catch (error) {
    console.error(`Error updating ROI for ${modelName}`, error);
    // Implement retry mechanism here if needed
  }
};

const calculateAllMyDailyROI = async () => {
  try {
    const users = await User.find({ status: "active" })
      .select("realEstateInvestment transportInvestment")
      .populate({
        path: "realEstateInvestment",
        model: "RealEstateInvestment",
      })
      .populate({
        path: "transportInvestment",
        model: "TransInvest",
      });
    for (const user of users) {
      const realEstateInvestment = user.realEstateInvestment;
      const transportInvestment = user.transportInvestment;

      const realEstateInvestmentROI = realEstateInvestment.map((investment) => {
        const { currentRoi } = investment;
        return currentRoi;
      });

      const transportInvestmentROI = transportInvestment.map((investment) => {
        const { currentRoi } = investment;
        return currentRoi;
      });

      const totalRealEstateInvestmentROI = realEstateInvestmentROI.reduce(
        (a, b) => a + b,
        0
      );
      const totalTransportInvestmentROI = transportInvestmentROI.reduce(
        (a, b) => a + b,
        0
      );
      const totalROI = user.dailyRoi +
        totalRealEstateInvestmentROI + totalTransportInvestmentROI;

      await user.updateOne({ dailyRoi: totalROI })
    }
    return true
  } catch (error) {
    throw error; // Rethrow the error for higher-level error handling
  }
};

// Transfer due roi to total balance 
// Helper function to process investments (both real estate and transport)
const processInvestments = async (investments, currentDate) => {
  let totalInvestmentROI = 0;

  for (const investment of investments) {
    const { currentRoi, createdAt, plan, invPeriod } = investment;
    const expirationDate = new Date(createdAt);
    expirationDate.setMonth(expirationDate.getMonth() + (plan || invPeriod));

    if (currentDate >= expirationDate) {
      totalInvestmentROI += currentRoi;
      // Reset current ROI to 0 after the plan period
      await investment.updateOne({ currentRoi: 0 });
    } else {
      // Calculate daily ROI for the remaining period
      const remainingDays = Math.floor(
        (expirationDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      const dailyRoi = (currentRoi / ((plan || invPeriod) * 30)) * remainingDays;
      totalInvestmentROI += dailyRoi;
    }
  }

  return totalInvestmentROI;
};

const transferDueRoi = async () => {
  try {
    console.log("Cron for due roi has started");
    const users = await User.aggregate([
      {
        $match: {
          status: "active"
        }
      },
      {
        $lookup: {
          from: "realestateinvestments", // Name of the RealEstateInvestment collection
          localField: "realEstateInvestment",
          foreignField: "_id",
          as: "realEstateInvestment"
        }
      },
      {
        $lookup: {
          from: "transinvests", // Name of the TransInvest collection
          localField: "transportInvestment",
          foreignField: "_id",
          as: "transportInvestment"
        }
      }
    ]);

    for (const user of users) {
      const totalRealEstateInvestmentROI = await processInvestments(
        user.realEstateInvestment,
        Date.now()
      );

      const totalTransportInvestmentROI = await processInvestments(
        user.transportInvestment,
        Date.now()
      );

      const totalROI = user.totalROI +
        totalRealEstateInvestmentROI + totalTransportInvestmentROI;

      await user.updateOne({ totalROI: totalROI });
    }

    console.log("Cron for due roi has ended");
    return true;
  } catch (error) {
    throw error; // Rethrow the error for higher-level error handling
  }
};



exports.updateRoi = () => {
  cron.schedule("0 0 * * *", () => {
    updateInvestmentsRoi(RealEstateInvestment, "Real Estate");
    updateInvestmentsRoi(TransInvest, "Transport");
    calculateAllMyDailyROI()
    transferDueRoi()
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });
};
