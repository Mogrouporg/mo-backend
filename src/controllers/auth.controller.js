const router = require('express').Router();
const { register, loginUser, verifyUser, requestOtp} = require('../services/auth.service');
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

module.exports = router;