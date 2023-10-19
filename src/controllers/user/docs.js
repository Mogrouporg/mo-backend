// Auth
/**
 * @api {post} /api/v1/signup Register a new user
 * @apiName Register
 * @apiGroup Auth
 * @apiVersion  1.0.0
 *  @apiBody {String} firstName User's first name
 * @apiBody {String} lastName User's last name
 * @apiBody {String} email User's email
 * @apiBody {String} password User's password
 * @apiBody {String} phoneNumber User's phone number
 * @apiBody {String} role User's role
 *  @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 CREATED
 * {
 *    "success": "true",
 *    "tokens": {
 *          "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZlbWljaHJpczA3QGdtYWlsLmNvbSIsImlhdCI6MTY4NTY0NjE1MCwiZXhwIjoxNjg1NzMyNTUwfQ.4781Yig0UNlyTwhconKFM8Cq5E_XFdIQ9phaz_vPsi8",
 *          "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NzhiN2RlMWM3ZTE4OTI3Nzg4ZjJiOCIsImlhdCI6MTY4NTY0NjE1MH0.K142Kgb0TBuwC3khsTNGvc6kGVS0noErw-ix0x821qY"
 *       },
 *       "user":{
 *       "_id": "6478b7de1c7e18927788f2b8",
 *       "isVerified": false,
 *       "status": "active",
 * }
 *
 */

/**
 * @api {post} /api/v1/login Login a user
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion  1.0.0
 * @apiBody {String} email User's email
 * @apiBody {String} password User's password
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "tokens": {
 *          "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZlbWljaHJpczA3QGdtYWlsLmNvbSIsImlhdCI6MTY4NTY0NjE1MCwiZXhwIjoxNjg1NzMyNTUwfQ.4781Yig0UNlyTwhconKFM8Cq5E_XFdIQ9phaz_vPsi8",
 *          "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NzhiN2RlMWM3ZTE4OTI3Nzg4ZjJiOCIsImlhdCI6MTY4NTY0NjE1MH0.K142Kgb0TBuwC3khsTNGvc6kGVS0noErw-ix0x821qY"
 *       },
 *       "user":{
 *       "_id": "6478b7de1c7e18927788f2b8",
 *       "isVerified": false,
 *       "status": "active",
 * }
 *  @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 * {
 *    "success": "false",
 *    "message": "Invalid credentials"
 * }
 *  @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 * {
 *    "success": "false",
 *    "message": "User not found"
 * }
 */

/**
 * @api {post} /api/v1/verify-otp Verify a user
 * @apiName Verify
 * @apiGroup Auth
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization Bearer token
 * @apiBody {String} otp User's otp
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "success": "true",
 *    "message": "User verified successfully"
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 *  {
 *    "success": "false",
 *    "message": "Invalid OTP"
 * }
 */

/**
 * @api {get} /api/v1/request-otp Request OTP
 * @apiName Request OTP
 * @apiGroup Auth
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization Bearer token
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "message": "OTP sent successfully"
 * }
 * @apiErrorExample {json} Error-Response:
 *  HTTP/1.1 401 UNAUTHORIZED
 * {
 *    "success": "false",
 *    "message": "User not found"
 * }
 */

/**
 * @api {post} /api/v1/logout Logout a user
 *  @apiName Logout
 * @apiGroup Auth
 * @apiVersion  1.0.0
 *  @apiHeader {String} Authorization Bearer token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 *  {
 *    "success": "true",
 *    "message": "User logged out successfully"
 * }
 */

/**
 * @api {post} /api/v1//user/forgot-password Forgot password
 * @apiName Forgot password
 * @apiGroup Auth
 *  @apiVersion  1.0.0
 *  @apiBody {String} email User's email
 *  @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "message": "Mail sent successfully"
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 * {
 *    "success": "false",
 *    "message": "User not found"
 *  }
 */

/**
 * @api {post} /api/v1/user/reset-password Reset password
 * @apiName Reset password
 * @apiGroup Auth
 *  @apiVersion  1.0.0
 *  @apiBody {otp} token User's token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "message": "You can reset your password now"
 *  }
 * @apiErrorExample {json} Error-Response:
 *  HTTP/1.1 401 UNAUTHORIZED
 * {
 *    "success": "false",
 *    "message": "otp expired"
 * }
 */
/**
 * @api {post} /api/v1/user/update-password update password
 * @apiName Update Password
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiParam {String} token User's token
 * @apiBody {String} new Password
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "message": "password reset successful"
 *  }
 * @apiErrorExample {json} Error-Response:
 *  HTTP/1.1 401 UNAUTHORIZED
 * {
 *    success: false,
 * }
 * /

/**
 * @api {post} /api/v1/user/edit-account Edit account
 * @apiName Edit account
 * @apiGroup Auth
 *  @apiVersion  1.0.0
 * @apiHeader {String} Authorization Bearer token
 * @apiBody {String} firstName User's firstName
 * @apiBody {String} lastName User's lastName
 * @apiBody {String} email User's email
 * @apiBody {String} phone User's phone
 *  @apiBody {Image} image User's image
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "message": "Account updated successfully"
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 *  {
 *       "success": "false",
 *       "message": "User not found"
 *    }
 */

/**
 * @api {post} /api/v1/refresh Refresh token
 * @apiName Refresh token
 *  @apiGroup Auth
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization Bearer token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 *  {
 *    "success": "true",
 *    "message": "Token refreshed successfully"
 *    "tokens": {
 *       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZlbWljaHJpczA3QGdtYWlsLmNvbSIsImlhdCI6MTY4NTY0NjE1MCwiZXhwIjoxNjg1NzMyNTUwfQ.4781Yig0UNlyTwhconKFM8Cq5E_XFdIQ9phaz_vPsi8",
 *       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NzhiN2RlMWM3ZTE4OTI3Nzg4ZjJiOCIsImlhdCI6MTY4NTY0NjE1MH0.K142Kgb0TBuwC3khsTNGvc6kGVS0noErw-ix0x821qY"
 *       }
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 *  {
 *    "success": "false",
 *    "message": "User not found"
 *  }
 */

// User
/**
 * @api {get} /api/v1/user/notifications Get User Notifications
 * @apiName Get User Notifications
 * @apiGroup User
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization Bearer token
 *   @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 *  {
 *    "success": "true",
 *    "notifications": [
 *          {
 *             "id": 1,
 *             "email":   "mail.com"
 *             "message": "You have a new notification",
 *             "createdAt": "2020-07-20T12:00:00.000Z",
 *              "updatedAt": "2020-07-20T12:00:00.000Z"
 *           }
 *       ]
 *    }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 *  {
 *    "success": "false",
 *    "message": "User not found"
 *  }
 */

/**
 * @api {post} /api/v1/user/account/deposit Deposit Funds
 * @apiName Deposit Funds
 * @apiGroup User
 * @apiVersion  1.0.0
 *  @apiHeader {String} Authorization Bearer token
 * @apiBody {String} amount Amount to deposit
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "data": {
 *       "reference": "7PVGX8MEk85tgeEpVDtD",
 *       "amount": 100,
 *       "user": "mail.com",
 *       "type": "deposit",
 *     },
 *    link: "https://checkout.paystack.com/7PVGX8MEk85tgeEpVDtD"
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 BAD REQUEST
 * {
 *    "success": "false",
 *    "message": "Can't deposit less than 1000"
 * }
 */

/**
 * @api {get} /api/v1/user/profile Get User Profile
 * @apiName Get User Profile
 * @apiGroup User
 *  @apiHeader {String} Authorization Bearer token
 * @apiVersion  1.0.0
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "data": {
 *       "_id": "6478b7de1c7e18927788f2b8",
 *       "firstName": "Christopher",
 *       "lastName": "Egbaaibon",
 *       "email": "femichris07@gmail.com",
 *       "phoneNumber": "08164393170",
 *       "balance": 0,
 *        "totalInvestment": 0,
 *       "totalRoi": 0,
 *       "totalLoan": 0,
 *       "profile_url": [],
 *       "isVerified": false,
 *       "role": "USER",
 *       "status": "active",
 *       "transactions": [],
 *       "notifications": [],
 *       "loanRequests": [],
 *       "realEstateInvestment": [],
 *       "transportInvestment": [],
 *       "createdAt": "2023-06-01T15:23:10.826Z",
 *       "updatedAt": "2023-06-01T19:02:32.834Z",
 *       "__v": 0
 *   }
 *}
 */

/**
 * @api {get} /api/v1/user/paystack/callback Paystack Callback
 * @apiName Paystack Callback
 * @apiGroup User
 * @apiVersion  1.0.0
 * @apiQuery {String} reference Reference from paystack
 *  @apiHeader {String} Authorization Bearer token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *   "message": "Deposit successful",
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 BAD REQUEST
 * {
 *    "success": "false",
 *    "message": "Error with the payment"
 *  }
 */

/**
 * @api {get} /api/v1/user/account/transactions Get User Transactions
 * @apiName Get User Transactions
 * @apiGroup User
 * @apiVersion  1.0.0
 *  @apiHeader {String} Authorization Bearer token
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * {
 *   "success": true,
 *  "data": [
 *      {
 *          "_id": "5f0b1b1e1c7e18927788f2b9",
 *          "reference": "7PVGX8MEk85tgeEpVDtD",
 *          "amount": 100,
 *          "user": "mail.com",
 *          "type": "deposit",
 *          "createdAt": "2020-07-11T12:00:00.000Z",
 *          "updatedAt": "2020-07-11T12:00:00.000Z"
 *       }
 *    ]
 * }
 *
 */

/**
 * @api {post} /api/v1/admin/signup Sign Up Admin
 * @apiName SignupAdmin
 * @apiGroup Admin
 *
 * @apiParam {String} lastName Admin's Last Name.
 * @apiParam {String} email Admin's Email.
 * @apiParam {String} phoneNumber Admin's Phone Number.
 * @apiParam {String} password Admin's Password.
 *
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {String} data Token for the new admin.
 *
 * @apiError {String} message Error message.
 */

/**
 * @api {get} /api/v1/admin/request-otp Request OTP for Admin
 * @apiName RequestOtpAdmin
 * @apiGroup Admin
 *
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {String} message Success message.
 * @apiSuccess {String} data Generated OTP.
 *
 * @apiError {String} message Error message.
 */

/**
 * @api {post} /api/v1/admin/verify-otp Verify OTP for Admin
 * @apiName VerifyOtpAdmin
 * @apiGroup Admin
 *
 * @apiParam {String} otp One Time Password.
 *
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {String} message Verification success message.
 *
 * @apiError {String} message Error message.
 * 
 * 
 * */
 
 /** 
 * @api {post} /api/v1/admin/withdrawal/:id/approve Approve Withdrawal Request
 * @apiName ApproveWithdrawalRequest
 * @apiGroup Admin
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization token
 * @apiParam {String} id Withdrawal Id
 * @apiBodyExample {json} Request-Example:
 * {
 *  "status": "Approved" || "Declined"
 * }
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Withdrawal.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "success": "true",
 *  "data":{
 *      "_id": "5f0b1b1e1c7e18927788f2b9",
 *      "amount": 100000,
 *      "user": "mail.com",
 *      "status": "approved",
 *      "createdAt": "2020-07-11T12:00:00.000Z",
 *      "updatedAt": "2020-07-11T12:00:00.000Z"
 *      }
 * }
 * 
 * @apiError {String} message Error message.
 **/

 /**
  *  @api {get} /api/v1/admin/getAllTransactions Get All Transactions
 * @apiName GetAllTransactions
 * @apiGroup Admin
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization token
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Transactions.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": "true",
 *  "data": [
 *     {
 *          "_id": "5f0b1b1e1c7e18927788f2b9",
 *          "reference": "7PVGX8MEk85tgeEpVDtD",
 *          "amount": 100,
 *          "user": "mail.com",
 *          "type": "deposit",
 *          "createdAt": "2020-07-11T12:00:00.000Z",
 *          "updatedAt": "2020-07-11T12:00:00.000Z"
 *     }
 *  ]
 * 
 * @apiError {String} message Error message.
 **/
/** 
 * 
 * @api {post} /api/v1/admin/real-estate/create Create Real Estate
 * @apiName CreateRealEstate
 * @apiVersion  1.0.0
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * 
 * @apiBodyExample {json} Request-Example:
 * {
 *      "name": "Real Estate",
 *      "amount": 100000,
 *      "size": 100,
 *      "address": "Lagos",
 *      "location": "Lagos",
 *      "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 *      "description": "This is a real estate",
 *      "state": "Osun"
 * }
 * 
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Real Estate.
 * @apiSuccessExample {json} Success-Response: 
 * HTTP/1.1 201 CREATED
 * {
 *      "success": "true",
 *     "data": {
 *          "_id": "5f0b1b1e1c7e18927788f2b9",
 *          "name": "Real Estate",
 *          "amount": 100000,
 *          "size": 100,
 *          "address": "Lagos",
 *          "location": "Lagos",
 *          "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],     
 *          "description": "This is a real estate",
 *          "state": "Osun",
 *          "createdAt": "2020-07-11T12:00:00.000Z",
 *          "updatedAt": "2020-07-11T12:00:00.000Z"
 *    }
 * }
 * 
 * @apiError {String} message Error message.
 * 
 * */

/**
 * @api {post} /api/v1/admin/transport/create Create Transport
 * @apiName CreateTransport
 * @apiGroup Admin
 * @apiVersion  1.0.0
 * @apiHeader {String} Authorization token
 * 
 * @apiBodyExample {json} Request-Example:
 * {
 *      "name": "Transport",
 *      "amount": 100000,
 *      "type": "Gold",
 *      "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 *      "description": "This is a transport",
 * }
 * 
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Transport.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 CREATED
 * {
 *     "success": "true",
 *    "data": {
 *         "_id": "5f0b1b1e1c7e18927788f2b9",
 *        "name": "Transport",
 *        "amount": 100000,
 *       "type": "Gold",
 *       "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 *       "description": "This is a transport",
 *      "createdAt": "2020-07-11T12:00:00.000Z",
 *      "updatedAt": "2020-07-11T12:00:00.000Z"
 *  }
 * }
 * 
 * @apiError {String} message Error message.    
 * 
 * */

/**
 * 
 * @api {get} /api/v1/admin/real-estates Get All Real Estates
 * @apiName GetAllRealEstates
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 *  @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Real Estates.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *   "data": [
 *     {
 *         "_id": "5f0b1b1e1c7e18927788f2b9",
 *        "name": "Real Estate",
 *       "amount": 100000,
 *       "size": 100,
 *      "address": "Lagos",
 *      "location": "Lagos",
 *     "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 *      "description": "This is a real estate",
 *     "state": "Osun",
 *    "numberOfBuyers": 0,
 *    "createdAt": "2020-07-11T12:00:00.000Z",
 *    "updatedAt": "2020-07-11T12:00:00.000Z"
 * }
 *  ]
 * }
 * 
 * @apiError {String} message Error message.
 * 
 * */

/**
 * @api {get} /api/v1/admin/real-estate/:id Get Single Real Estate
 * @apiName GetSingleRealEstate
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiParam {String} id Real Estate Id
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Real Estate.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": "true",
 *  "data": {
 *      "_id": "5f0b1b1e1c7e18927788f2b9",
 *     "name": "Real Estate",
 *    "amount": 100000,
 *   "size": 100,
 *  "address": "Lagos",
 * "location": "Lagos", 
 * "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 * "description": "This is a real estate",
 * "state": "Osun",
 * "numberOfBuyers": 0,
 * "createdAt": "2020-07-11T12:00:00.000Z",
 * "updatedAt": "2020-07-11T12:00:00.000Z"
 * }
 * } 
 * 
 * 
 * @apiError {String} message Error message.
 *
 **/

/**
 * 
 * @api {get} /api/v1/admin/transports Get All Transports
 * @apiName GetAllTransports
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Transports.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "success": "true",
 * "data": [
 *    {
 *      "_id": "5f0b1b1e1c7e18927788f2b9",
 *      "name": "Transport",
 *      "amount": 100000,
 *      "type": "Gold",
 *      "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 *      "description": "This is a transport",
 *      "numberOfBuyers": 0,
 *      "createdAt": "2020-07-11T12:00:00.000Z",
 *      "updatedAt": "2020-07-11T12:00:00.000Z"
 * }
 * ]
 * }
 * 
 * @apiError {String} message Error message.
 * 
 * */

/**
 * @api {get} /api/v1/admin/transport/:id Get Single Transport
 * @apiName GetSingleTransport
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiParam {String} id Transport Id
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Transport.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "success": "true",
 * "data": {
 *      "_id": "5f0b1b1e1c7e18927788f2b9",
 *      "name": "Transport",
 *      "amount": 100000,
 *      "type": "Gold",
 *      "images": ['https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-1.jpg', 'https://res.cloudinary.com/djxhcwowp/image/upload/v1614628239/real-estate/real-estate-2.jpg'],
 *      "description": "This is a transport",
 *      "numberOfBuyers": 0,
 *      "createdAt": "2020-07-11T12:00:00.000Z",
 *      "updatedAt": "2020-07-11T12:00:00.000Z"
 *   }
 * }
 * 
 * 
 * @apiError {String} message Error message.
 * 
 * */

/**
 * 
 * @api {get} /api/v1/admin/loans?category= Create Loan Request
 * @apiName getLoanRequests
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiQuery {String} status Loan Status (pending, approved, declined)
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Loan Request.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 CREATED
 * {
 * "success": "true",
 * "data":[{
 *    "_id": "5f0b1b1e1c7e18927788f2b9",
 *    "amount": 100000,
 *   "user": "mail.com",
 *  "status": "pending",
 * "createdAt": "2020-07-11T12:00:00.000Z",
 * "updatedAt": "2020-07-11T12:00:00.000Z"
 *  }
 * ]
 * }
 * 
 * @apiError {String} message Error message.
 * */

/**
 * 
 * 
 * @api {get} /api/v1/admin/loan/:id Get Single Loan Request
 * @apiName GetSingleLoanRequest
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiParam {String} id Loan Request Id
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Loan Request.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "success": "true",
 * "data":{
 *   "_id": "5f0b1b1e1c7e18927788f2b9",
 *  "amount": 100000,
 * "user": "mail.com",
 * "status": "pending",
 * "createdAt": "2020-07-11T12:00:00.000Z",
 * "updatedAt": "2020-07-11T12:00:00.000Z"
 * }
 * }
 * 
 * @apiError {String} message Error message.
 * 
 * */

/**
 * 
 * 
 * @api {post} /api/v1/admin/loan/:id/approve Approve Loan Request
 * @apiName ApproveLoanRequest
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiParam {String} id Loan Request Id
 * @apiBodyExample {json} Request-Example:
 * {
 *   "status": "Approved" || "Declined"
 * }
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Loan Request.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "success": "true",
 * "data":{
 *  "_id": "5f0b1b1e1c7e18927788f2b9",
 * "amount": 100000,
 * "user": "mail.com",
 * "status": "approved",
 * "createdAt": "2020-07-11T12:00:00.000Z",
 * "updatedAt": "2020-07-11T12:00:00.000Z"
 * }
 * 
 * 
 * @apiError {String} message Error message. 
 * 
 * */

/**
 * 
 * @api {get} /api/v1/admin/witdrawals Get All Withdrawals
 * @apiName GetAllWithdrawals
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Withdrawals.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "success": "true",
 * "data":[{
 *      "_id": "5f0b1b1e1c7e18927788f2b9",
 *      "amount": 100000,
 *      "user": "mail.com",
 *      "status": "pending",
 *      "createdAt": "2020-07-11T12:00:00.000Z",
 *      "updatedAt": "2020-07-11T12:00:00.000Z"
 *    }
 * ]
 * }
 * 
 * @apiError {String} message Error message.
 * 
 * */

/**
 * 
 * @api {get} /api/v1/admin/withdrawal/:id Get Single Withdrawal
 * @apiName GetSingleWithdrawal
 * @apiGroup Admin
 * @apiHeader {String} Authorization token
 * @apiParam {String} id Withdrawal Id
 * @apiSuccess {Boolean} success Success status.
 * @apiSuccess {JSON} data Withdrawal.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "success": "true",
 *  "data":{
 *      "_id": "5f0b1b1e1c7e18927788f2b9",
 *      "amount": 100000,
 *      "user": "mail.com",
 *      "status": "pending",
 *      "createdAt": "2020-07-11T12:00:00.000Z",
 *      "updatedAt": "2020-07-11T12:00:00.000Z"
 *  }
 * }
 * 
 * @apiError {String} message Error message.
 * 
*/





