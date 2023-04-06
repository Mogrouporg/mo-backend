const router = require('express').Router();
const { register, loginUser, verifyUser, requestOtp, logout, forgotPassword, verifyOtpForgotPassword} = require('../../services/users/auth.service');
const {verifyToken} = require("../../utils/updateToken.utils");



router.get('/render', (req, res)=>{
    res.json({
        isOperational: true,
        message: "Hello"
    })
})

router.post('/signup', register)
router.post('/verify-otp', verifyToken, verifyUser);
router.get('/request-otp', verifyToken, requestOtp);
router.post('/login', loginUser);
router.post('/logout', verifyToken, logout);
router.post('/user/forgot-password', forgotPassword)
router.post('/user/reset-password/:token', verifyOtpForgotPassword);

module.exports = router;