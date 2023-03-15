const express = require('express');
const { config } = require('dotenv');
const {db} = require("./config/db.config");


const app = express();
app.use((req, res, next) => {
    const error = new Error('Invalid endpoint');
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
config();


app.listen(process.env.PORT, db() ,()=>{
    console.log('Server started running on ' + process.env.PORT)
})