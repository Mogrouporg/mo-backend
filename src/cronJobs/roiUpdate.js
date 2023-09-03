const cron = require('node-cron');
const { RealEstateInvestment } = require('../models/realEstateInvestments.model');
const { TransInvest } = require('../models/transInvestments.model');

const isLeapYear = year => ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);

const updateInvestmentsRoi = async (InvestmentModel, modelName) => {
  try {
    console.log(`Cron started for ${modelName}`);

    const investments = await InvestmentModel.find({ status: 'owned' });

    const currentYear = new Date().getFullYear();
    const divisor = isLeapYear(currentYear) ? 366 : 365;

    const updates = investments.map(investment => ({
      updateOne: {
        filter: { _id: investment._id },
        update: { $inc: { currentRoi: investment.roi / divisor } },
      },
    }));

    const result = await InvestmentModel.bulkWrite(updates);

    console.log(`Updated ROI for ${result.nModified} ${modelName} investments.`);
  } catch (error) {
    console.error(`Error updating ROI for ${modelName}`, error);
    // Implement retry mechanism here if needed
  }
};

exports.updateRoi = () => {
  cron.schedule('0 0 * * *', () => {
    updateInvestmentsRoi(RealEstateInvestment, 'Real Estate');
    updateInvestmentsRoi(TransInvest, 'Transport');
  });
};
