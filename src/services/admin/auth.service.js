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
            return res.status(400).json({
                message: "All fields required"
            })
        } else {
            const oldEmail = await User.findOne({email: email}) || await Admin.findOne({email: email});
            const oldPhoneNumber = await User.findOne({phoneNumber: phoneNumber}) || await Admin.findOne({phoneNumber: phoneNumber});
            if (oldEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email has been taken"
                })
            } else if (oldPhoneNumber) {
                return res.status(400).json({
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
                const _id = newAdmin.id;
                const otp = await genOtp();
                console.log(otp, _id)
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
                return res.status(201).json({
                    success: true,
                    data: token
                })
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.requestOtpAdmin = async(req, res)=> {
    try {
        const admin = req.admin;
        const otp = await genOtp();
        await saveOtp(admin.id, otp)
        await sendMail({
            email: admin.email,
            subject: "Account Verification",
            text: `Your one time password is ${otp}, thanks`
        })
        console.log(otp)
        return res.status(200).json({
            success: true,
            message: "Otp sent!",
            data: otp
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Internal Server error"
        })
    }
}
exports.verifyOtpAdmin = async (req, res)=>{
    try {
        const _id = req.admin.id;
        const { otp } = req.body;
        if(await verifyOtp(_id, otp) === true){
            await Admin.findByIdAndUpdate(_id, { isVerified: true}, { new: true});
            return res.status(200).json({
                success: true,
                message: "User verified successfully"
            });
        }else{
            return res.status(401).json({
                message: "Invalid otp"
            })
        }
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Interval Error"
        })
    }
}

exports.loginAdmin = async (req, res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required"
            })
        }else{
            const admin = await Admin.findOne({email: email});
            if(!admin){
                return res.status(400).json({
                    message: "User does not exist"
                })
            }else{
                if(!await bcrypt.compareSync(password, admin.password)){
                    return res.status(401).json({
                        message: "Invalid Password"
                    });
                }else{
                    const token = await jwt.sign({"_id": admin._id}, process.env.TOKEN_KEY_ADMIN, {
                        expiresIn: '1h'
                    })
                    await updateTokenAdmin(admin._id, token);
                    return res.status(200).json({
                        success: true,
                        message: "logged In",
                        data: token
                    })
                }
            }
        }
    }catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Interval Server error"
        });
    }
}

exports.logout = async(req, res)=>{
    try {
        const admin = req.admin;
        const token = req.admin.token;
        if(admin.token === req.headers.authorization || admin.token === req.params.token) {
            await Admin.findOneAndUpdate({email: admin.email, token: token}, {
                $set: {
                    token: null
                }
            });
            return res.status(200).json({
                success: true,
                message: "Logged out"
            })
        }
        else{
            return res.status(400).json({
                message: "You have logged out already!"
            })
        }
    }catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Interval server error"
        })
    }
}

exports.forgotPassword = async(req, res)=>{
    try {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({
                success: false,
                message: "Field is required"
            })
        }else{
            const user = await Admin.findOne({email: email});
            if(!user){
                return res.status(400).json({
                    success: false,
                    message: "Account with this email not found"
                })
            }else{
                const token = await genForgotPasswordToken()
                await saveOtp(email, token)
                await Admin.findOneAndUpdate({ email: email}, { resetPasswordToken: token }, { new: true});
                const link = `https://mo-backend.onrender.com/api/v1/admin/reset-password/${token}`
                await sendMail({
                    email: email,
                    subject: 'Forgot password',
                    text: `To reset your password, click on this reset link ${link}`
                })
                return res.status(200).json({
                    resetToken: token,
                    success: true,
                    message: "Mail sent!"
                })
            }
        }
    }catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.resetPassword = async (req, res)=>{
    try {
        const { token} = req.params;
        if(!token){
            return res.status(401).json({
                message: "Token not found"
            })
        }else{
            const user = await Admin.findOne({ resetPasswordToken: token });
            if(!await verifyOtp(user.email, token)){
                return res.status(401).json({
                    message: "Not found"
                });
            }else{
                const { password } = req.body;
                const hashed = await bcrypt.hashSync(password, 10);
                await user.updateOne({ password: hashed, resetPasswordToken: null})

                await sendMail({
                    email: user.email,
                    subject: 'Password reset',
                    text:  'Password reset successful'
                })

                return res.status(200).json({
                    success: true,
                    data: hashed,
                })
            }
        }
    }catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}