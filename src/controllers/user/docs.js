// Auth
/**
 * @api {post} /api/v1/auth/signup Register a new user
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
 * @api {post} /api/v1/auth/login Login a user
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
 * @api {post} /api/v1/auth/verify-otp Verify a user
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
 * @api {get} /api/v1/auth/request-otp Request OTP
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
 * @api {post} /api/v1/auth/logout Logout a user
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
 * @api {post} /api/v1/auth/user/forgot-password Forgot password
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
 * @api {post} /api/v1/auth/user/reset-password/:token Reset password
 * @apiName Reset password
 * @apiGroup Auth
 *  @apiVersion  1.0.0
 *  @apiParam {String} token User's token
 * @apiBody {String} password User's password
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "success": "true",
 *    "message": "Password reset successfully"
 *  }
 * @apiErrorExample {json} Error-Response:
 *  HTTP/1.1 401 UNAUTHORIZED
 * {
 *    "success": "false",
 *    "message": "link expired"
 * }
 */

/**
 * @api {post} /api/v1/auth/user/edit-account Edit account
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
 * @api {post} /api/v1/auth/refresh Refresh token
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
 * @api {get} /user/notifications Get User Notifications
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
 * @api {post} /user/account/deposit Deposit Funds
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
 * @api {get} /user/profile Get User Profile
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
 * @api {get} /user/paystack/callback Paystack Callback
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
 * @api {get} /user/account/transactions Get User Transactions
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
