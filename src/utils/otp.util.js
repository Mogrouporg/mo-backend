const speakeasy = require('speakeasy');
const {User} = require('../models/users.model')

exports.genOtp = async (email) => {
    const secret = speakeasy.generateSecret({length: 20});
    const savedSecret = secret.base32;
    await User.findOneAndUpdate({email: email}, {
        otpSecret: savedSecret
    }, {new: true})
}