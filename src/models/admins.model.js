const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
    {
        name:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        password:{
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        token: {
            type: String
        }

    },
    {
        timestamps: true
    }
);

AdminSchema.pre("save", function (next) {
    const admin = this;

    if (!admin.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(admin.password, salt, function (err, hash) {
            if (err) return next(err);

            admin.password = hash;
            next();
        });
    });
});

AdminSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const Admin = mongoose.model("Admin", AdminSchema);

module.exports ={
    Admin: Admin
}