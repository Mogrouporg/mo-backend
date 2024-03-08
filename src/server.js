const express = require("express");
const { config } = require("dotenv");
const fs = require("fs");
const { db } = require("./config/db.config");
const router = require("./controllers/user/auth.controller");
const fileUpload = require("express-fileupload");
const useRouter = require("./controllers/user/user.controller");
const routerAdmin = require("./controllers/admin/auth.controller");
const routerAdminTask = require("./controllers/admin/admin.controller");
const { setUsersInactive } = require("./cronJobs/inactiveUser.cron");
const cors = require("cors");
const { updateRoi } = require("./cronJobs/roiUpdate");
const { payLoan } = require("./cronJobs/payloan.cron");
const path = require("path");
const https = require("https");

const app = express();
app.use(express.json());
const allowedOrigins = [
  "https://mo-website-5715.vercel.app",
  "http://localhost:3000",
  "https://infomogroupltd.com",
  "http://192.168.8.114:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// app.use(cors({
//     origin: '*',
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
// }));

// app.options('*', cors());

// app.use(express.static(path.join(__dirname, '../docs')));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
// });
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: false }));

if (process.env.MODE === "production") {
  app.use("/api/v1", router);
  app.use("/api/v1/user", useRouter);
  app.use("/api/v1/admin", routerAdmin, routerAdminTask);
} else {
  if (process.env.MODE === "development") {
    app.use("/test/api/v1", router);
    app.use("/test/api/v1/user", useRouter);
    app.use("/test/api/v1/admin", routerAdmin, routerAdminTask);
  }
}

config();
setUsersInactive();
updateRoi();
payLoan;

app.use((req, res, next) => {
  const error = new Error("Invalid endpoint, wetin you dey look for here?");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: {
      message: err.message,
    },
  });
});

if (process.env.MODE === "development") {
  db(process.env.DEV_DB);
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
} else {
  db(process.env.MONGO_URI);
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

//TODO: ask for the remaining functions to add to the admin and super admin. :)
