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
        amount:{
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
        description:{
            type: String
        },
        onSale: {
            type: Boolean,
            default: true
        },
        roiPercent :{
            type: Number,
            default: 36
        }
    },{
        timestamps: true
    }
)

const Transportation = mongoose.model("Transportation", transportationSchema);

module.exports = {
    Transportation: Transportation
}