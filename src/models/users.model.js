const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
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
            required: true,
            unique: true
        },
        balance: {
            type: Number,
            default: 0
        },
        totalInvestment:{
            type: Number,
            default:  0
        },
        totalRoi:{
            type: Number,
            default: 0
        },
        dailyRoi:{
            type: Number,
            default: 0
        },
        totalLoan: {
            type: Number,
            default: 0
        },
        password: {
            type: String,
            required: false
        },
        refreshTokenHash:{
            type: String,
            required: false
        },
        resetPasswordToken:{
            type: String,
            default: false
        },
        resetPasswordExp:{
            type: Date,
            required: false
        },
        profile_url:{
            type: Array,
            required: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        role:{
           type: String,
           enum: ['USER', 'AGENT']
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        lastTransact:{
            type: Date
        },
        transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
        notifications:[{ type: Schema.Types.ObjectId, ref: 'Notification' }],
        loanRequests:[{ type: Schema.Types.ObjectId, ref: 'Loan' }],
        realEstateInvestment: [{ type: Schema.Types.ObjectId, ref: 'RealEstateInvestment' }],
        transportInvestment: [{ type: Schema.Types.ObjectId, ref: 'TransportInvestment' }],
    },{
        timestamps: true
    }
);

const argon2 = require('argon2');

UserSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    try {
        //const salt = await argon2.
        const hash = await argon2.hash(user.password);

        user.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

// UserSchema.pre("save", function (next) {
//     const user = this;

//     if (!user.isModified("password")) return next();

//     bcrypt.genSalt(10, function (err, salt) {
//         if (err) return next(err);

//         bcrypt.hash(user.password, salt, function (err, hash) {
//             if (err) return next(err);

//             user.password = hash;
//             next();
//         });
//     });
// });
// UserSchema.methods.comparePassword = function (password) {
//     return bcrypt.compareSync(password, this.password);
// };

const User = mongoose.model("User", UserSchema);

module.exports = {
    User,
};
