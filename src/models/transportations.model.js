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
            type: Array,
        },
        numberOfBuyers: {
            type: Number,
            default: 0
        },
        roi:{
            type: Number
        },
        description:{
            type: String
        },
        onSale: {
            type: Boolean,
            default: true
        }
    },{
        timestamps: true
    }
)

const Transportation = mongoose.model("Transportation", transportationSchema);

module.exports = {
    Transportation: Transportation
}