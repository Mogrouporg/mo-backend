const mongoose = require("mongoose");
const {mongo} = require("mongoose");
const schema = mongoose.Schema;

const transactionSchema = new schema(
    {
        user:{
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["success", "failed"]
        },
        balance: {
            type: String
        },
        reference: {
            type: String
        }
    },{
        timestamps: true
    }
)

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {
    Transaction: Transaction
}