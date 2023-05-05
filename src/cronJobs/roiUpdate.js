const cron = require('node-cron');
const { RealEstateInvestment } = require('../models/realEstateInvestments.model');

exports.updateRoi = async()=>{
   cron.schedule('0 0 * * *', async ()=>{
      console.log('Cron started');
       const investments = await RealEstateInvestment.find({ status: 'owned' })
       const roiPerDay = investments.map((investment) => ({
         id: investment._id,
         roi: investment.roi / 365,
       }));
   
       await Promise.all(
         roiPerDay.map(({ id, roi }) =>
           RealEstateInvestment.findByIdAndUpdate(
             id,
             { $inc: { currentRoi: roi } },
             { new: true }
           )
         )
       );
       console.log(`Updated ROI for ${roiPerDay.length} investments.`);
   })
}