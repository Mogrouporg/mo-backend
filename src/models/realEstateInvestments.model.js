const mongoose = require("mongoose");
const schema = mongoose.Schema;

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
        currency: {
            type: String,
            enum: ['USD', 'NGN']
        }
    },{
        timestamps: true
    }
)

const RealEstateInvestment = mongoose.model('RealEstateInvestment', RealEstateInvestmentSchema);
module.exports = {
    RealEstateInvestment: RealEstateInvestment
}