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
            enum: ['gold', 'silver', 'bronze'],
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        image: {
            type: String,
        }
    },{
        timestamps: true
    }
)

const Transportation = mongoose.model("Transportation", transportationSchema);

module.exports = {
    Transportation: Transportation
}