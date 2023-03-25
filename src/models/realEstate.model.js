const mongoose = require('mongoose');
const schema = mongoose.Schema;

const realEstateSchema = new schema(
    {
        user:{
            type: String,
            required: true
        },
        propertyName: {
            type: String,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        sizeInSqm:{
            type: String,
            required: true
        },
        address:{
            type: String,
            required: true
        },
        image:{
            type: String,
        },
        location:{
            type: String,
            required: true
        },
        numberOfBuyers:{
            type: Number,
            default: 0
        }
    },{
        timestamps: true
    }
);

const RealEstate = mongoose.model("RealEstate", realEstateSchema);

module.exports ={
    RealEstate: RealEstate
}