const useRouter = require('express').Router();
const {verifyToken} = require("../../utils/updateToken.utils");
const { findNotifById } = require('../../services/notif/notif.services');
const {deposit, verifyDeposit, investInRealEstate, sellRealEstateInvestment, investInTransport, sellTransportInvestment, withdrawFunds} = require("../../services/users/finance.services");
const {myProfile, getMyTransactions, getSingleRealEstateInvestment, getSingleTransInvestment} = require("../../services/users/account.service");
const { getAllRealInvestments, getAllTransInvestments } = require('../../services/admin/admin.service');

useRouter.get('/user/notifications', verifyToken, findNotifById);
//Payments && Balance
useRouter.post('/account/deposit', verifyToken, deposit);
useRouter.get('/profile', verifyToken, myProfile)
useRouter.get('/paystack/callback', verifyDeposit);
useRouter.get('/account/transactions', verifyToken, getMyTransactions);
useRouter.post('/real-estate/:id/invest', verifyToken, investInRealEstate );
useRouter.post('/real-estate/:id/sell', verifyToken, sellRealEstateInvestment);
useRouter.post('/transport/:id/invest', verifyToken, investInTransport);
useRouter.post('/transport/:id/sell', verifyToken, sellTransportInvestment);
useRouter.post('/account/withdraw', verifyToken, withdrawFunds);
useRouter.get('/real-estate/:id', verifyToken, getSingleRealEstateInvestment);
useRouter.get('/transport/:id', verifyToken, getSingleTransInvestment);
useRouter.get('/real-estate', verifyToken, getAllRealInvestments);
useRouter.get('/transport', verifyToken, getAllTransInvestments);
module.exports = useRouter;