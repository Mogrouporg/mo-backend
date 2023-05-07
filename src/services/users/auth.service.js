const { User } = require('../../models/users.model');
const { genOtp, verifyOtp, saveOtp, genForgotPasswordToken} = require('../../utils/otp.util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {updateToken, generateAccessToken, generateRefreshToken} = require("../../utils/updateToken.utils");
const {sendMail} = require("../../utils/mailer");
const {compareSync} = require("bcrypt");

exports.register = async (req, res)=>{
    try{
            const firstName = req.body.firstName;
            const  lastName = req.body.lastName;
            const  email = req.body.email
            const  phoneNumber = req.body.phoneNumber;
            const password = req.body.password;
            const  role = req.body.role;
            const currency = req.body.currency;
            if(!firstName || !lastName || !email || !phoneNumber || !password || !role){
                res.status(400).json({
                    message: "All fields required"
                })
            }else{
                const oldUser = await User.findOne({email: email});
                if(oldUser) {
                    res.status(401).json({
                        message: "User already exists"
                    })
                    console.log(oldUser.email, email)
                }else{
                    const newUser = new User({
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                        password,
                        role
                    });
                    console.log(email)
                    await newUser.save();
                    const otp = await genOtp();
                    await saveOtp(email, otp)
                    console.log(otp)
                    // sends a mail
                    await sendMail({
                        email: email,
                        subject: "Account Verification",
                        text: `Your one time password is ${otp}, thanks`,
                    })
                    const token = await generateAccessToken({email: newUser.email});
                    const refreshToken = await generateRefreshToken({id: newUser.id});
                    //console.log(token, refreshToken);
                    const hash = bcrypt.hashSync(refreshToken, 10);
                    await updateToken(email, hash)
                    res.status(201).json({
                        success: true,
                        tokens: {
                            accessToken: token,
                            refreshToken: refreshToken
                        },
                        user: await User.findById(newUser.id).select('isVerified status') 
                    })
                }
            }
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

exports.verifyUser = async(req, res)=>{
    try {
        const email = req.user.email;
        //const user = await User.findOne({ email: email});
        const {otp} = req.body;
        if(await verifyOtp(email, otp) === true){
            await User.findOneAndUpdate({ email: email}, { isVerified: true}, { new: true});
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
        console.log(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

exports.requestOtp = async(req, res)=>{
    try {
        const email = req.user.email;
        console.log(email)
        const otp = await genOtp();
        await saveOtp(email, otp)
        await sendMail({
            email: email,
            subject: "Account Verification",
            text: `Your one time password is ${otp}, thanks`
        })
        console.log(otp)
        res.status(200).json({
            success: true,
            message: "Otp sent!",
            data: otp
        })
    }catch (e){
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}


exports.loginUser = async(req, res)=>{
    try {
        const { email, password } = req.body;
        if(!email || !password){
         res.status(400).json({
             success: false,
             message: "All fields are required!"
         })   ;
        }else{
            const existingUser = await User.findOne({email: email});
            if (!existingUser) {
                res.status(400).json({
                    success: false,
                    message: "User does not exist!"
                })
            }else{
                if (!compareSync(password, existingUser.password)) {
                    res.status(401).json({
                        success: false,
                        message: "Invalid password"
                    });
                }else{
                    //if(existingUser.status === 'inactive'){
                      //  await existingUser.updateOne({ status : 'active'});

                    //}
                    const token = generateAccessToken({email: existingUser.email })
                    const refreshToken = generateRefreshToken({id: existingUser.id});
                    const hash = bcrypt.hashSync(refreshToken, 10)
                    await updateToken(email, hash);
                    res.status(200).json({
                        success: true,
                        message: "logged In",
                        tokens:{
                            accessToken: token,
                            refreshToken: refreshToken
                        },
                        user: await User.findById(existingUser.id).select('isVerified status')
                    })
                }
            }
        }
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.logout = async (req, res)=>{
    try {
        const user = req.user;
        const token = req.user.token;
        if(user.token === req.headers.authorization || user.token === req.params.token){
            await User.findOneAndUpdate({email: user.email, token: token},{$set:{
                token: null
                }});
            res.status(200).json({
                success: true,
                message: "Logged out"
            })
        }else{
            res.status(400).json({
                message: "You have logged out already!"
            })
        }
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

exports.refresh = async(req, res)=>{
    try {
        const {id} = req.user;
        const { refreshToken } = req.body;
        const user = await User.findById(id);
        const isMatch =  bcrypt.compareSync(refreshToken, user.refreshTokenHash);
        if(!isMatch){
            res.status(401).json({
                message: "Not authorized"
            })
        }else{
            const accessToken = await generateAccessToken({email: user.email});
            const refreshTokenNew = await generateRefreshToken({id: user.id});
            const hash = bcrypt.hashSync(refreshTokenNew, 10)
            await updateToken(user.email, hash)
            res.status(200).json({
                success: true,
                tokens:{
                    accessToken,
                    refreshToken: refreshTokenNew
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.forgotPassword = async(req, res)=>{
    try {
        const { email } = req.body;
        if(!email){
            res.status(400).json({
                success: false,
                message: "Field is required"
            })
        }else{
            const user = await User.findOne({email: email});
            if(!user){
                res.status(400).json({
                    success: false,
                    message: "Account with this email not found"
                })
            }else{
                const token = await genForgotPasswordToken()
                await saveOtp(email, token)
                await User.findOneAndUpdate({ email: email}, { resetPasswordToken: token }, { new: true});
                const link = `https://mo-backend.onrender.com/api/v1/user/reset-password/${token}`
                await sendMail({
                    email: email,
                    subject: 'Forgot password',
                    text: `To reset your password, click on this reset link ${link}`
                })
                res.status(200).json({
                    resetToken: token,
                    success: true,
                    message: "Mail sent!"
                })
            }
        }
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.verifyOtpForgotPassword = async(req, res)=>{
    try {
        const { token} = req.params;
        if(!token){
            res.status(401).json({
                message: "Token not found"
            })
        }else{
            const user = await User.findOne({ resetPasswordToken: token });
            if(!await verifyOtp(user.email, token)){
                res.status(401).json({
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

                res.status(200).json({
                    success: true,
                })
            }
        }
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}
