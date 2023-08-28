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
            type: Number,
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
            type: Array,
        },
        location:{
            type: String,
            required: true
        },
        state:{
            type: String,
        },
        numberOfBuyers:{
            type: Number,
            default: 0
        },
        roi: {
            type: Number
        },
        onSale:{
            type: Boolean,
            default: false
        }
    },{
        timestamps: true
    }
);

const RealEstate = mongoose.model("RealEstate", realEstateSchema);

module.exports ={
        RealEstate: RealEstate
}