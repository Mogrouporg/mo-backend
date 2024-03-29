const mongoose = require("mongoose");
const argon2 = require("argon2");
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
    {
        name:{
            type: String,
            required: false
        },
        email:{
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
        role: {
        type: String,
        enum: ["ADMIN"]
        },
        refreshTokenHash:{
            type: String
        },
        resetPasswordStatus:{
            type: Boolean,
        },
        resetPasswordToken:{
            type: String
        },
        isSuperAdmin:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

AdminSchema.pre("save", async function (next) {
    const admin = this;

    if (!admin.isModified("password")) return next();

    try {
        //const salt = await argon2.
        const hash = await argon2.hash(admin.password);

        admin.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports ={
    Admin: Admin
}