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
        loanDesc:{
            type: String
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