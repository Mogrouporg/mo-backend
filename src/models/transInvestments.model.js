const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Investment = require('./investment');

const transInvestSchema = new schema(
    {
        propertyId: {
            type: schema.Types.ObjectId,
            name: "Transportation",
            required: true
        },
        userId: {
            type: schema.Types.ObjectId,
            name: "User",
            required: true
        },
        status:{
            type: String,
            enum: ['owned','onSale', 'sold']
        },
        invPeriod:{
            type: String
        },
        currentRoi:{
            type: Number
        },
        roi:{
            type: Number
        },
        transaction:{
            type: schema.Types.ObjectId,
            ref: "Transaction",
        }
    }, {
        timestamps: true
    }
)

const TransInvest = Investment.discriminator("TransInvest", transInvestSchema);
module.exports = {
    TransInvest: TransInvest
};