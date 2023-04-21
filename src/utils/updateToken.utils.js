const { User } = require('../models/users.model');
const jwt = require('jsonwebtoken');
const {Admin} = require("../models/admins.model");
require('dotenv').config()

exports.updateToken = async (email, token)=>{
    return User.findOneAndUpdate({email: email}, {token: token}, { new: true});
}

exports.verifyToken = async (req, res, next )=>{
    try {
        const token = req.headers.authorization || req.body.token || req.params.token
        if(!token){
            res.status(401).redirect('https://join-monie.vercel.app/login')
        }else{
            await jwt.verify(token, process.env.TOKEN_KEY, async function (err, decoded){
                const key = decoded.email;
                const user = await User.findOne({email: key});
                if(!user) {
                    res.status(401).json({
                        message: 'User not found'
                    })
                }
                req.user = user;
            })
            next()
        }
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Please login again"
        })
    }
}

exports.verifyTokenAdmin = async (req, res, next )=>{
    try {
        const token = req.headers.authorization || req.body.token || req.params.token
        if(!token){
            res.status(401).redirect('https://join-monie.vercel.app/login')
        }else{
            await jwt.verify(token, process.env.TOKEN_KEY_ADMIN, async function (err, decoded){
                const key = decoded._id;
                const user = await Admin.findById(key);
                if(!user) {
                    res.status(401).json({
                        message: 'You are not allowed to perform this action!'
                    })
                }
                req.admin = user;
            })
            next()
        }
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Please login again"
        })
    }
}

exports.updateTokenAdmin = async(_id, token)=>{
    return Admin.findByIdAndUpdate(_id, { token: token }, { new: true });
}