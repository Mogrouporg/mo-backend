const router = require('express').Router();
const { register, loginUser, verifyUser, requestOtp, logout, forgotPassword, verifyOtpForgotPassword, refresh, resetPassword} = require('../../services/users/auth.service');
const {verifyToken} = require("../../utils/updateToken.utils");
const {editAccount} = require("../../services/users/account.service");
const path = require('path');
//const {upload} = require("../../utils/imageUpload.util");

router.post('/signup', register)
router.post('/verify-otp', verifyToken, verifyUser);
router.get('/request-otp', verifyToken, requestOtp);
router.post('/login', loginUser);
router.post('/logout', verifyToken, logout);
router.post('/user/forgot-password', forgotPassword)
router.post('/user/reset-password', verifyOtpForgotPassword);
router.post('/user/update-password/:token',  resetPassword)
router.post('/user/edit-account', verifyToken, editAccount);
router.post('/refresh', verifyToken, refresh);

module.exports = router;