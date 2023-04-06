const express = require('express');
const { config } = require('dotenv');
const {db} = require("./config/db.config");
const router = require("./controllers/auth.controller");
const fileUpload = require('express-fileupload')


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: true}))
app.use('/api/v1', router)
config();

app.use((req, res, next) => {
    const error = new Error('Invalid endpoint, wetin you dey look for here?');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

app.listen(process.env.PORT || 3500, db() ,()=>{
    console.log('Server started running on ' + process.env.PORT)
})