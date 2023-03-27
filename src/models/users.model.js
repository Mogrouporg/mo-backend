const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const schema = mongoose.Schema;

const UserSchema = new schema(
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
        password: {
            type: String,
            required: false
        },
        token:{
            type: String,
            required: false
        },
        resetPasswordToken:{
            type: String
        },
        resetPasswordExp:{
            type: Date,
            required: false
        },
        profile_url:{
            type: String,
            required: false
        },
        isVerified: {
            type: Boolean,
            default: true
        },
        role:{
           type: String,
           enum: ['USER', 'AGENT', 'ADMIN']
        },
        otpSecret:{
            type: String,
        }
    },{
        timestamps: true
    }
);

UserSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports ={
    User
}