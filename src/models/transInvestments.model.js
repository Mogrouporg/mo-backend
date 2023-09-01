const mongoose = require("mongoose");
const schema = mongoose.Schema;

const transInvestSchema = new schema(
    {
        transportId: {
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
        }
    }, {
        timestamps: true
    }
)

const TransInvest = mongoose.model("TransInvest", transInvestSchema);
module.exports = {
    TransInvest: TransInvest
};