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
      const totalROI =
        totalRealEstateInvestmentROI + totalTransportInvestmentROI;

      await user.updateOne({dailyRoi: totalROI})
    }
    return true
  } catch (error) {
    throw error; // Rethrow the error for higher-level error handling
  }
};

// Transfer due roi to total balance 
const transferDueRoi = async () => {
  try {
    console.log("Cron for due roi has started")
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
        const { currentRoi, roi, invPeriod, createdAt } = investment;
        const expirationDate = new Date(createdAt);
        expirationDate.setMonth(expirationDate.getMonth() + invPeriod);

        if (expirationDate.getTime() === Date.now()) {
          console.log("We have one")
          return currentRoi;
        }
        console.log("Nothing is returned") // Return 0 if the condition is not met
        return 0;
      });

      const transportInvestmentROI = transportInvestment.map((investment) => {
        const { currentRoi, roi, invPeriod, createdAt } = investment;
        const expirationDate = new Date(createdAt);
        expirationDate.setMonth(expirationDate.getMonth() + invPeriod);

        if (expirationDate.getTime() === Date.now()) {
          console.log("We have one")
          return currentRoi;
        }
        console.log("Nothing is returned") // Return 0 if the condition is not met
        return 0; 
      });

      const totalRealEstateInvestmentROI = realEstateInvestmentROI.reduce(
        (a, b) => a + b,
        0
      );
      const totalTransportInvestmentROI = transportInvestmentROI.reduce(
        (a, b) => a + b,
        0
      );
      const totalROI =
        totalRealEstateInvestmentROI + totalTransportInvestmentROI;

      await user.updateOne({ totalROI: totalROI });
    }
    console.log("Cron for due roi has ended")
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
  });
};
