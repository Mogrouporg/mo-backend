const mongoose = require('mongoose')
require('dotenv').config();

exports.db = async(uri)=>{
    try{
        mongoose.connect(uri, (err)=>{
            if(err){
                console.log(`Error connecting to the database`)
                process.exit(0)
            }
            console.log("Db connected!")
        })
    }catch(e) {
        console.log(e)
    }
}