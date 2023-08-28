const routerAdminTask = require('express').Router();
const { getAllTransactions, getAllUsers, getSingleUser, createLandInvestment, getAllRealInvestments,
    getSingleRealEstate,
    createTransportInvestment
} = require('../../services/admin/admin.service')
const {verifyTokenAdmin} = require("../../utils/updateToken.utils");

routerAdminTask.get('/getAllTransactions', verifyTokenAdmin, getAllTransactions);
routerAdminTask.post('/getAllUsers', verifyTokenAdmin, getAllUsers);
routerAdminTask.get('/user/:userId', verifyTokenAdmin, getSingleUser);

//realEstate
routerAdminTask.post('/real-estate/create', verifyTokenAdmin, createLandInvestment);
routerAdminTask.post('/transport', verifyTokenAdmin, createTransportInvestment);
routerAdminTask.get('/real-estates', verifyTokenAdmin, getAllRealInvestments);
routerAdminTask.get('/real-estate/:id', verifyTokenAdmin, getSingleRealEstate);

module.exports = routerAdminTask;