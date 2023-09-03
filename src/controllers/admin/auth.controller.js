const routerAdmin = require('express').Router();
const { forgotPassword, logout, loginAdmin, resetPassword, signupAdmin, verifyOtpAdmin, requestOtpAdmin} = require('../../services/admin/auth.service');
const {verifyTokenAdmin} = require("../../utils/updateToken.utils");


routerAdmin.get('/render', (req, res)=>{
    return res.json({
        isOperational: true,
        message: "Hello, Admin"
    })
});

routerAdmin.post('/signup', signupAdmin);
routerAdmin.post('/verify-otp', verifyTokenAdmin, verifyOtpAdmin);
routerAdmin.get('/request-otp', verifyTokenAdmin, requestOtpAdmin);
routerAdmin.post('/login', loginAdmin);
routerAdmin.post('/logout', verifyTokenAdmin, logout);
routerAdmin.post('/forgot-password', forgotPassword); 
routerAdmin.post('/reset-password/:token', resetPassword);

module.exports =  routerAdmin;
