const routerAdmin = require('express').Router();
const { forgotPassword, logout, loginAdmin, resetPassword, signupAdmin, verifyOtpAdmin, requestOtpAdmin, verifyResetPassword, loginSuperAdmin} = require('../../services/admin/auth.service');
const {verifyTokenAdmin, verifySuperAdmin} = require("../../utils/updateToken.utils");


routerAdmin.get('/render', (req, res)=>{
    return res.json({
        isOperational: true,
        message: "Hello, Admin"
    })
});

routerAdmin.post('/login-super', loginSuperAdmin);
routerAdmin.post('/signup', verifySuperAdmin, signupAdmin);
routerAdmin.post('/verify-otp', verifyTokenAdmin, verifyOtpAdmin);
routerAdmin.get('/request-otp', verifyTokenAdmin, requestOtpAdmin);
routerAdmin.post('/login', loginAdmin);
routerAdmin.post('/logout', verifyTokenAdmin, logout);
routerAdmin.post('/forgot-password', forgotPassword); 
routerAdmin.post('/reset-password', verifyResetPassword);
routerAdmin.post('/update-password/:token', resetPassword);

module.exports =  routerAdmin;
