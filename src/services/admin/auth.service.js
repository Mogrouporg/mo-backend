const {genOtp, verifyOtp, saveOtp, genForgotPasswordToken} = require('../../utils/otp.util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {updateTokenAdmin} = require("../../utils/updateToken.utils");
const {sendMail} = require("../../utils/mailer");
const {Admin} = require('../../models/admins.model');
const {User} = require("../../models/users.model");


exports.signupAdmin = async (req, res) => {
    try {
        const name = req.body.lastName;
        const email = req.body.email
        const phoneNumber = req.body.phoneNumber;
        const password = req.body.password;
        if (!name || !email || !phoneNumber || !password) {
            res.status(400).json({
                message: "All fields required"
            })
        } else {
            const oldEmail = await User.findOne({email: email}) || await Admin.findOne({email: email});
            const oldPhoneNumber = await User.findOne({phoneNumber: phoneNumber}) || await Admin.findOne({phoneNumber: phoneNumber});
            if (oldEmail) {
                res.status(400).json({
                    success: false,
                    message: "Email has been taken"
                })
            } else if (oldPhoneNumber) {
                res.status(400).json({
                    success: false,
                    message: "Phone Number has been taken"
                })
            } else {
                const newAdmin = new Admin({
                    name,
                    email,
                    phoneNumber,
                    password
                });
                await newAdmin.save();
                const _id = newAdmin._id;
                const otp = genOtp();
                await saveOtp(_id, otp);
                await sendMail({
                    email: email,
                    subject: "Account Verification",
                    text: `Your one time password is ${otp}, thanks`,
                });
                const token = await jwt.sign({"_id": _id}, process.env.TOKEN_KEY_ADMIN, {
                    expiresIn: '1d'
                });
                await updateTokenAdmin(_id, token);
                res.status(201).json({
                    success: true,
                    data: token
                })
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.verifyOtpAdmin = async (req, res)=>{
    try {
        const _id = req.user._id;
        const { otp } = req.body.body;
        if(await verifyOtp(_id, otp) === true){
            await Admin.findByIdAndUpdate(_id, { isVerified: true}, { new: true});
            res.status(200).json({
                success: true,
                message: "User verified successfully"
            });
        }else{
            res.status(401).json({
                message: "Invalid otp"
            })
        }
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Interval Error"
        })
    }
}