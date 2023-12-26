const cron = require("node-cron");
const {
  RealEstateInvestment,
} = require("../models/realEstateInvestments.model");
const {TransInvest} = require("../models/transInvestments.model");
const {User} = require("../models/users.model");

const notifyAdmin = (message, error) => {
  // You can extend this function to send a notification, email, or alert to an admin.
  console.error(message, error);
};


/**
 * Determines if a given year is a leap year.
 * @param {number} year - The year to be checked.
 * @returns {boolean} - True if the year is a leap year, otherwise false.
 */
const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;


/**
 * Updates the ROI for investments.
 * This function calculates the daily ROI increment based on whether the year is a leap year or not
 * and updates the respective investments.
 * @param {Model} InvestmentModel - The Mongoose model representing the investment.
 * @param {string} modelName - The name of the investment type (for logging purposes).
 */
const updateInvestmentsRoi = async (InvestmentModel, modelName) => {
  try {
    console.log(`Cron started for ${modelName}`);

    const investments = await InvestmentModel.find({status: "owned"});

    const currentYear = new Date().getFullYear();
    const divisor = isLeapYear(currentYear) ? 366 : 365;

    const updates = investments.map((investment) => ({
      updateOne: {
        filter: {_id: investment._id},
        update: {$inc: {currentRoi: investment.roi / divisor}},
      },
    }));

    const result = await InvestmentModel.bulkWrite(updates);

    console.log(
      `Updated ROI for ${result.nModified} ${modelName} investments.`
    );
  } catch (error) {
    notifyAdmin(`Error updating ${modelName} investments ROI.`, error);
    throw error; // Rethrow the error for higher-level error handling
  }
};




/**
 * Calculates the daily ROI for each active user.
 * This function aggregates users with their respective investments and updates their daily ROI.
 */
const calculateAllMyDailyROI = async () => {
  try {
    const users = await User.find({status: "active"}).populate({
      path: "realEstateInvestment",
      model: "RealEstateInvestment",
      match: {status: "owned"},
      populate: {
        path: "realEstate",
        model: "RealEstate"
      }
    }).populate({
      path: "transportInvestment",
      model: "TransInvest",
      match: {status: "owned"},
      populate: {
        path: "transport",
        model: "Transport"
      }
    })

    for (const user of users) {
      const realEstateInvestment = user.realEstateInvestment;
      const transportInvestment = user.transportInvestment;

      const realEstateInvestmentROI = realEstateInvestment.map((investment) => {
        const {currentRoi} = investment;
        return currentRoi;
      });

      const transportInvestmentROI = transportInvestment.map((investment) => {
        const {currentRoi} = investment;
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
      const totalROI = totalRealEstateInvestmentROI + totalTransportInvestmentROI;

      await user.updateOne({dailyRoi: totalROI})
    }
    return true
  } catch (error) {
    notifyAdmin(`Error calculating daily ROI for users.`, error);
    throw error; // Rethrow the error for higher-level error handling
  }
};

/**
 * Helper function to process investments.
 * This function calculates the total ROI for investments that are either completed or ongoing.
 * @param {Array} investments - List of investments to be processed.
 * @param {Date} currentDate - The current date to determine if an investment is completed or ongoing.
 * @returns {number} - The total ROI for the given investments.
 */
const processInvestments = async (investments, currentDate) => {
  let totalInvestmentROI = 0;
  let amountInvested2 = 0;

  for (const investment of investments) {

    const {currentRoi, createdAt, plan, invPeriod, amountInvested} = investment;
    const expirationDate = new Date(createdAt);
    expirationDate.setMonth(expirationDate.getMonth() + (plan || invPeriod));

    if (currentDate >= expirationDate) {
      totalInvestmentROI += currentRoi;
      // Reset current ROI to 0 after the plan period and set status to "completed"
      await investment.updateOne({currentRoi: 0, status: "completed"});
    } else {
      const remainingDays = Math.floor(
        (expirationDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      const dailyRoi = (currentRoi / ((plan || invPeriod) * 30)) * remainingDays;
      totalInvestmentROI += dailyRoi;
      amountInvested2 = amountInvested;
    }
  }

  return {totalInvestmentROI, amountInvested2};
};

const processRealEstateInvestments = async (investments, currentDate) => {
  let totalInvestmentROI = 0;
  let hasMatchingInvestment = false;
  let amountInvested = 0;

  for (const investment of investments) {
    const {currentRoi, invPeriod, createdAt, amountInvested} = investment;

    const expirationDate = new Date(createdAt);
    expirationDate.setMonth(expirationDate.getMonth() + invPeriod);

    const current = new Date(currentDate);

    if (expirationDate.getDate() === current.getDate() &&
      expirationDate.getMonth() === current.getMonth() &&
      expirationDate.getFullYear() === current.getFullYear()) {
      hasMatchingInvestment = true;
      console.log("We have one");
      totalInvestmentROI += currentRoi;
      amountInvested = amountInvested;
      // Set the status to "completed" for the matching investments
      await investment.updateOne({status: "completed"});
    }
  }

  if (!hasMatchingInvestment) {
    console.log("Nothing is returned");
  }

  return {totalInvestmentROI, amountInvested};
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
          from: "realestateinvestments",
          localField: "realEstateInvestment",
          foreignField: "_id",
          as: "realEstateInvestment"
        }
      },
      {
        $lookup: {
          from: "transinvests",
          localField: "transportInvestment",
          foreignField: "_id",
          as: "transportInvestment"
        }
      },
      {
        $match: {
          $expr: {
            $and: [
              {$gt: [{$size: {$filter: {input: "$realEstateInvestment", as: "rei", cond: {$eq: ["$$rei.status", "completed"]}}}}, 0]},
              {$gt: [{$size: {$filter: {input: "$transportInvestment", as: "ti", cond: {$eq: ["$$ti.status", "completed"]}}}}, 0]}
            ]
          }
        }
      }
    ]);


    for (const user of users) {

      const {totalRealEstateInvestmentROI, amountInvested} = await processRealEstateInvestments(
        user.realEstateInvestment,
        Date.now()
      );

      const {totalTransportInvestmentROI, amountInvested2} = await processInvestments(
        user.transportInvestment,
        Date.now()
      );

      const totalROI = totalRealEstateInvestmentROI + totalTransportInvestmentROI;

      await user.updateOne({$inc: {dailyRoi: -totalROI}});
    }
    return true;
  } catch (error) {
    throw error; // Rethrow the error for higher-level error handling
  }
};


/**
 * Scheduled task to update the ROI for investments.
 * This function uses a cron job to periodically update the ROI for Real Estate and Transport investments,
 * calculate the daily ROI, and transfer any due ROI.
 */
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

exports.isLeapYear = isLeapYear;
exports.updateInvestmentsRoi = updateInvestmentsRoi;
exports.calculateAllMyDailyROI = calculateAllMyDailyROI;
exports.processInvestments = processInvestments;
exports.processRealEstateInvestments = processRealEstateInvestments;
exports.transferDueRoi = transferDueRoi;
