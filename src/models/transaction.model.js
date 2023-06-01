const mongoose = require("mongoose");
const {mongo} = require("mongoose");
const schema = mongoose.Schema;

const transactionSchema = new schema(
    {
        amount:{
          type: String,
        },
        user:{
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["success", "failed", "abandoned", "pending"]
        },
        balance: {
            type: String
        },
        reference: {
            type: String
        },
        type:{
            type: String,
            enum: ['deposit', 'loan', 'withdrawal', 'invest']
        }
    },{
        timestamps: true
    }
)

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {
    Transaction: Transaction
}