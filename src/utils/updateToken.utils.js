const { User } = require('../models/users.model');
const jwt = require('jsonwebtoken');
const {Admin} = require("../models/admins.model");
require('dotenv').config()


exports.generateAccessToken = async (user)=>{
    return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1d'})
};

exports.generateRefreshToken = async (user)=>{
    return jwt.sign(user, process.env.REFRESH_TOKEN)
}

exports.updateToken = async (email, token)=>{
    return User.findOneAndUpdate({email: email}, {refreshTokenHash: token}, { new: true});
}

exports.verifyToken = async (req, res, next )=>{
    try {
        const token = req.headers.authorization || req.body.token || req.params.token
        if(!token){
            return res.status(401).redirect('https://mo-website-c20ooye8m-mogroup.vercel.app/login')
        }else{
            await jwt.verify(token, process.env.ACCESS_TOKEN, async function (err, decoded){
                const key = decoded.email;
                const user = await User.findOne({email: key});
                if(!user) {
                    return res.status(401).json({
                        message: 'User not found'
                    })
                }
                req.user = user;
            })
            next()
        }
    }catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Please login again"
        })
    }
}

exports.verifyTokenAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization || req.body.token || req.params.token;
        if (!token) {
            return res.status(401).redirect('https://join-monie.vercel.app/login');
        }

        jwt.verify(token, process.env.ACCESS_TOKEN, async function(err, decoded) {
            if (err) {
                console.error(err);
                return res.status(401).json({
                    message: 'Invalid token!'
                });
            }

            const key = decoded._id;
            const admin = await Admin.findById(key);
            if (!admin) {
                return res.status(401).json({
                    message: 'You are not allowed to perform this action!'
                });
            }
            req.admin = admin;
            next();
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Please login again"
        });
    }
};

exports.updateTokenAdmin = async(_id, token)=>{
    return Admin.findByIdAndUpdate(_id, { refreshTokenHash: token }, { new: true });
}

exports.verifySuperAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization || req.body.token || req.params.token;
        if (!token) {
            return res.status(401).json({
                message: 'You are not allowed to perform this action!'
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SUPER, async function(err, decoded) {
            if (err) {
                console.error(err);
                return res.status(401).json({
                    message: 'Invalid token!'
                });
            }
            let admin;
            const key = decoded._id;
            
            if (key !== process.env.SUPER_ADMIN_ID) {
                return res.status(401).json({
                    message: 'You are not allowed to perform this action!'
                });
            }
            
            req.superAdmin = admin;
            next();
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Please login again"
        });
    }
}