const { User } = require('../models/users.model');
const { genOtp, verifyOtp, saveOtp} = require('../utils/otp.util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {updateToken} = require("../utils/updateToken.utils");
const {sendMail} = require("../utils/mailer");

exports.register = async (req, res)=>{
    try{
            const firstName = req.body.firstName;
            const  lastName = req.body.lastName;
            const  email = req.body.email
            const  phoneNumber = req.body.phoneNumber;
            const password = req.body.password;
            const  role = req.body.role
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
                    const token = jwt.sign({"email": email}, process.env.TOKEN_KEY, {
                        expiresIn: '1d'
                    });
                    await updateToken(email, token)
                    res.status(201).json({
                        success: true,
                        data: token
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
        const existingUser = await User.findOne({email: email});
        if(!existingUser){
            res.status(400).json({
                success: false,
                message: "User does not exist!"
            })
        }
        if(!bcrypt.compareSync(password, existingUser.password)){
            res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = await jwt.sign({email}, process.env.TOKEN_KEY, {
            expiresIn: '1d'
        });
        await updateToken(email, token);

        res.status(200).json({
            success: true,
            message: "logged In",
            data: token
        })
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}