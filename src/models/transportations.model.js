const mongoose = require("mongoose");
const schema = mongoose.Schema;

const transportationSchema = new schema(
    {
        transportName: {
            type: String,
            required: true
        },
        transportType: {
            type: String,
            enum: ['Gold', 'Silver', 'Bronze'],
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        image: {
            type: String,
        },
        numberOfBuyers: {
            type: Number,
            default: 0
        },
        roi:{
            type: Number
        }
    },{
        timestamps: true
    }
)

const Transportation = mongxoose.model("Transportation", transportationSchema);

module.exports = {
    Transportation: Transportation
}