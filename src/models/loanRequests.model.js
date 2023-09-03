const mongoose = require('mongoose');
const schema = mongoose.Schema;

const loanRequestSchema = new schema(
    {
        user:{
            type: String,
            required: true
        },
        loanAmount:{
            type: String,
        },
        loanPeriod: {
            type: Number,
            max: 3,
        },
        loanDesc:{
            type: String
        },
        status:{
            type: String,
            enum: ['Pending', 'Approved', 'Declined'],
            default: 'pending'
        },
        paid:{
            type: Boolean,
            default: false
        },
        bankDetails:{
            bankName: String,
            accountName: String,
            accountNumber: String
        },
        transaction:{
            type: schema.Types.ObjectId,
            ref: "Transaction"
        }
    },
    {
        timestamps: true
    }
)

const loanRequest = mongoose.model('loanRequest', loanRequestSchema);

module.exports = {
    loanRequest: loanRequest
}