const routerAdminTask = require("express").Router();
const {
  getAllTransactions,
  getAllUsers,
  getSingleUser,
  createLandInvestment,
  getSingleRealEstate,
  createTransportInvestment,
  getAllRealEstates,
  getAllTransports,
  getSingleTransport,
  approveLoan,
  getAllLoans,
  getSingleLoan,
  approveWithdrawal,
  getAllWithdrawalRequests,
  getSingleWithdrawalRequest,
  searchRealEstates,
  searchTransports
} = require("../../services/admin/admin.service");
const { verifyTokenAdmin } = require("../../utils/updateToken.utils");

routerAdminTask.get(
  "/getAllTransactions",
  verifyTokenAdmin,
  getAllTransactions
);
routerAdminTask.post("/getAllUsers", verifyTokenAdmin, getAllUsers);
routerAdminTask.get("/user/:userId", verifyTokenAdmin, getSingleUser);

//realEstate
routerAdminTask.post(
  "/real-estate/create",
  verifyTokenAdmin,
  createLandInvestment
);
routerAdminTask.post(
  "/transport/create",
  verifyTokenAdmin,
  createTransportInvestment
);
routerAdminTask.get("/real-estates", verifyTokenAdmin, getAllRealEstates);
routerAdminTask.get("/real-estate/:id", verifyTokenAdmin, getSingleRealEstate);
routerAdminTask.get("/transports", verifyTokenAdmin, getAllTransports);
routerAdminTask.get("/transport/:id", verifyTokenAdmin, getSingleTransport);
routerAdminTask.get("/real-estate/search", verifyTokenAdmin, searchRealEstates);
routerAdminTask.get("/transport/search", verifyTokenAdmin, searchTransports);

// Approval
// Loans
routerAdminTask.post('/loans/:id/approve', verifyTokenAdmin, approveLoan);
routerAdminTask.get('/loans', verifyTokenAdmin, getAllLoans)
routerAdminTask.get('/loans/:id', verifyTokenAdmin, getSingleLoan)
// Withdrawals
routerAdminTask.post('/withdrawals/:id/approve', verifyTokenAdmin, approveWithdrawal);
routerAdminTask.get('/withdrawals', verifyTokenAdmin, getAllWithdrawalRequests);
routerAdminTask.get('/withdrawals/:id', verifyTokenAdmin, getSingleWithdrawalRequest);
module.exports = routerAdminTask;
