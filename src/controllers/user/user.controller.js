const useRouter = require('express').Router();
const {verifyToken} = require("../../utils/updateToken.utils");
const { findNotifById } = require('../../services/notif/notif.services');
const {deposit, verifyDeposit, investInRealEstate, sellRealEstateInvestment, investInTransport, sellTransportInvestment, withdrawFunds, fetchLoanHistory, requestLoan} = require("../../services/users/finance.services");
const {myProfile, getMyTransactions, getSingleRealEstateInvestment, getSingleTransInvestment, addBankDetails, editAccount, getSingleTransportTation, getSingleRealEstate} = require("../../services/users/account.service");
const { getAllRealInvestments, getAllTransInvestments } = require('../../services/admin/admin.service');

useRouter.get('/user/notifications', verifyToken, findNotifById);
//Payments && Balance
useRouter.post('/account/deposit', verifyToken, deposit);
useRouter.get('/profile', verifyToken, myProfile);
useRouter.post('/account/edit', verifyToken, editAccount);
useRouter.get('/paystack/callback', verifyToken, verifyDeposit);
useRouter.get('/account/transactions', verifyToken, getMyTransactions);
useRouter.post('/real-estate/:id/invest', verifyToken, investInRealEstate );
useRouter.post('/real-estate/:id/sell', verifyToken, sellRealEstateInvestment);
useRouter.post('/transport/:id/invest', verifyToken, investInTransport);
useRouter.post('/transport/:id/sell', verifyToken, sellTransportInvestment);
useRouter.post('/account/withdraw', verifyToken, withdrawFunds);
useRouter.get('/real-estate/:id', verifyToken, getSingleRealEstate);
useRouter.get('/transport/:id', verifyToken, getSingleTransportTation);
useRouter.get('/real-estates', verifyToken, getAllRealInvestments);
useRouter.get('/transports', verifyToken, getAllTransInvestments);
useRouter.get('/loan-history', verifyToken, fetchLoanHistory);
useRouter.post('/loan/apply', verifyToken, requestLoan);
useRouter.post('/loan/apply', verifyToken, addBankDetails);
useRouter.post('/add-bank-details', verifyToken, addBankDetails);
module.exports = useRouter; 