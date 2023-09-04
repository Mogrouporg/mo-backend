const express = require('express');
const { config } = require('dotenv');
const {db} = require("./config/db.config");
const router = require("./controllers/user/auth.controller");
const fileUpload = require('express-fileupload')
const useRouter = require("./controllers/user/user.controller");
const routerAdmin = require("./controllers/admin/auth.controller");
const routerAdminTask = require("./controllers/admin/admin.controller")
const { setUsersInactive } = require("./cronJobs/inactiveUser.cron")
const cors = require('cors');
const { updateRoi } = require('./cronJobs/roiUpdate');
const {payLoan} = require('./cronJobs/payloan.cron');
const path = require('path');


const app = express();
app.use(express.json());
const allowedOrigins = ['https://mo-website-5715.vercel.app', 'http://localhost:3000', 'https://infomogroupltd.com', 'http://192.168.8.114:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.static(path.join(__dirname, '../docs')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: false}))
app.use('/api/v1', router)
app.use('/api/v1/user', useRouter)
app.use('/api/v1/admin', routerAdmin, routerAdminTask)
config();
setUsersInactive();
updateRoi();
payLoan;


app.use((req, res, next) => {
    const error = new Error('Invalid endpoint, wetin you dey look for here?');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    return res.json({
        error: {
            message: err.message
        }
    });
});

app.listen(process.env.PORT || 3500, db() ,()=>{
    console.log('Server started running on ' + process.env.PORT)
}) 