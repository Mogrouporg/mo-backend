const mongoose = require("mongoose");
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
            enum: ["Success", "Failed", "Abandoned", "Pending"]
        },
        balance: {
            type: String
        },
        reference: {
            type: String
        },
        type:{
            type: String,
            enum: ['Deposit', 'Loan', 'Withdrawal', 'Invest']
        }
    },{
        timestamps: true
    }
)

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {
    Transaction: Transaction
}