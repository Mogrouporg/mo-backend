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
        bankName:{
            type: String
        },
        accountNumber:{
            type: String
        },
        accountName:{
            type: String
        },
        loanDesc:{
            type: String
        },
        status:{
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        paid:{
            type: Boolean,
            default: false
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