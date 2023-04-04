const router = require('express').Router();
const { register, loginUser, verifyUser, requestOtp, logout, forgotPassword} = require('../services/auth.service');
const {verifyToken} = require("../utils/updateToken.utils");



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

module.exports = router;