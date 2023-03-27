const speakeasy = require('speakeasy');
const {User} = require('../models/users.model')

exports.genOtp = async (email) => {
    const secret = speakeasy.generateSecret({length: 20});
    const savedSecret = secret.base32;
    const otp = speakeasy.totp({
        secret: savedSecret,
        encoding: 'base32'
    });
    await User.findOneAndUpdate({email: email}, {
        otpSecret: savedSecret,
    }, {new: true})
    return otp;
}

exports.verifyOtp = async (user, body, next)=>{
    const findUser = User.findOne({email: user});
    const tokenSecret = findUser.otpSecret;
    const isVerified = speakeasy.totp.verify({
        secret: tokenSecret,
        token: body,
        encoding: 'base32',
        window: 6
    });
    if(isVerified === true){
        findUser.isVerified = true;
    }
    next()
}