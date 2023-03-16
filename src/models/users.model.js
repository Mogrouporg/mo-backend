const mongoose = require("mongoose");
const schema = mongoose.Schema;

const User = new schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phoneNumber:{
            type: String,
            required: true
        },
        balance: {
            type: Number,
            required: true
        },
        password: {
            type: String,
            required: false
        },
        token:{
            type: String,
            required: false
        },
        verifyUserToken:{
            type: String,
            required: false
        },

    },{
        timestamps: true
    }
)