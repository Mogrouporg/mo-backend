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
  banUser,
  activateUser,
  searchRealEstates,
  searchTransports,
  totalCounts,
  searchUsers,
  editTransportInvestment,
  editLandInvestment,
  deleteTransportInvestment,
  deleteLandInvestment,
} = require("../../services/admin/admin.service");
const { editUser, deleteUser, getSingleAdmin, getAdmins } = require("../../services/admin/superAdmin.service");
const { verifyTokenAdmin, verifySuperAdmin } = require("../../utils/updateToken.utils");

routerAdminTask.get(
  "/getAllTransactions",
  verifyTokenAdmin,
  getAllTransactions
);
routerAdminTask.post("/getAllUsers", verifyTokenAdmin, getAllUsers);
routerAdminTask.get("/getAllUsers", verifyTokenAdmin, searchUsers);
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
routerAdminTask.post("/transport/edit/:id", verifyTokenAdmin, editTransportInvestment);
routerAdminTask.post("/real-estate/edit/:id", verifyTokenAdmin, editLandInvestment);
routerAdminTask.post("/transport/delete/:id", verifyTokenAdmin, deleteTransportInvestment);
routerAdminTask.post("/real-estate/delete/:id", verifyTokenAdmin, deleteLandInvestment);


// Approval
// Loans
routerAdminTask.post('/loans/:id/approve', verifyTokenAdmin, approveLoan);
routerAdminTask.get('/loans', verifyTokenAdmin, getAllLoans)
routerAdminTask.get('/loans/:id', verifyTokenAdmin, getSingleLoan)
// Withdrawals
routerAdminTask.post('/withdrawals/:id/approve', verifyTokenAdmin, approveWithdrawal);
routerAdminTask.get('/withdrawals', verifyTokenAdmin, getAllWithdrawalRequests);
routerAdminTask.get('/withdrawals/:id', verifyTokenAdmin, getSingleWithdrawalRequest);

// Ban
routerAdminTask.post('/banUser/:id', verifyTokenAdmin, banUser);
routerAdminTask.post('/activateUser/:id', verifyTokenAdmin, activateUser);
routerAdminTask.get('/counts', verifyTokenAdmin, totalCounts)

//super admin
routerAdminTask.post('/superAdmin/editUser/:id', verifySuperAdmin, editUser);
routerAdminTask.post('/superAdmin/deleteUser/:id', verifySuperAdmin, deleteUser);
routerAdminTask.get('/superAdmin/getAllAdmins', verifySuperAdmin,  getAdmins);
routerAdminTask.get('/superAdmin/admin/:id', verifySuperAdmin, getSingleAdmin);

//TODO: add other admin routes here, don't forget to export them

module.exports = routerAdminTask;
