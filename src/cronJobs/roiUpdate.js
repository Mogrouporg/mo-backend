const cron = require('node-cron');
const { RealEstateInvestment } = require('../models/realEstateInvestments.model');

const updateInvestmentsRoi = async () => {
  try {
    console.log('Cron started');

    // Fetch all owned investments
    const investments = await RealEstateInvestment.find({ status: 'owned' });

    // Prepare updates by calculating daily ROI and adding it to the current ROI
    const updates = investments.map(investment => ({
      updateOne: {
        filter: { _id: investment._id },
        update: { $inc: { currentRoi: investment.roi / 365 } },
      },
    }));

    // Execute bulk updates
    const result = await RealEstateInvestment.bulkWrite(updates);

    console.log(`Updated ROI for ${result.nModified} investments.`);
  } catch (error) {
    console.error('Error updating ROI', error);
  }
};

exports.updateRoi = () => {
  cron.schedule('0 0 * * *', updateInvestmentsRoi);
};
