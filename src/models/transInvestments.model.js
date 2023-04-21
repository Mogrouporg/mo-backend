const mongoose = require("mongoose");
const schema = mongoose.Schema;

const transInvestSchema = new schema(
    {
        transportId: {
            type: schema.Types.ObjectId,
            name: "transports",
            required: true
        },
        userId: {
            type: schema.Types.ObjectId,
            name: "Users",
            required: true
        },
        status:{
            type: String,
            enum: ['ongoing','paid']
        }
    }, {
        timestamps: true
    }
)

const TransInvest = mongoose.model("TransInvest", transInvestSchema);
module.exports = {
    TransInvest: TransInvest
};