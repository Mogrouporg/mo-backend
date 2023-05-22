const useRouter = require('express').Router();
const {verifyToken} = require("../../utils/updateToken.utils");
const { findNotifById } = require('../../services/notif/notif.services');
const {deposit, verifyDeposit} = require("../../services/users/finance.services");
const {myProfile, getMyTransactions} = require("../../services/users/account.service");

useRouter.get('/user/notifications', verifyToken, findNotifById);
//Payments && Balance
useRouter.post('/account/deposit', verifyToken, deposit);
useRouter.get('/profile', verifyToken, myProfile)
useRouter.get('/paystack/callback', verifyDeposit);
useRouter.get('/account/transactions', verifyToken, getMyTransactions);
module.exports = useRouter;