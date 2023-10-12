const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Investment = require('./investment');

const RealEstateInvestmentSchema = new schema(
    {
        user: {
            type: String,
            required: true
        },
        propertyId: {
            type: schema.Types.ObjectId,
            ref: 'RealEstate',
            required: true
        },
        roi: {
            type: Number,
        },
        invPeriod: {
            type: String
        },
        status:{
          type: String,
          enum: ['owned', 'onSale', 'sold']
        },
        currentRoi:{
            type: Number,
            default: 0
        },
        transaction:{
            type: schema.Types.ObjectId,
            ref: 'Transaction'
        }
    },{
        timestamps: true
    }
)

const RealEstateInvestment = Investment.discriminator('RealEstateInvestment', RealEstateInvestmentSchema);
module.exports = {
    RealEstateInvestment: RealEstateInvestment
}