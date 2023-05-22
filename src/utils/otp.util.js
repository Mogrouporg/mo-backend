const speakeasy  = require('speakeasy');
const redis = require('redis');
require('dotenv').config();
const {createClient} = require("redis");
const crypto = require("crypto");
const connection = async ()=>{
    try {
        const client = createClient({
            url: process.env.REDIS_PUBLIC_URL,
            password: process.env.REDIS_PASSWORD
        });
        // await client.connect()
        //client.on('error', (err) => console.log(err));
        //client.on('connect', () => console.log('connect'));
        return client;
    }catch (e) {
        console.log(e)
    }
}

exports.addToRedis = async (key, value, expiresIn) => {
    const redisClient = await connection();
    try {
        return await redisClient.set(key, value, expiresIn);
    } catch (error) {
        console.log(error)
    }
};

exports.deleteFromRedis = async (key) => {
    const redisClient = await connection();
    try {
        return redisClient.del(key);
    } catch (error) {
        console.log(error)
    }
};

exports.getValueFromRedis = async (key) => {
    try {
        const redisClient = await connection();
        return redisClient.get(key);
    } catch (error) {
        console.log(error)
    }
};

exports.genOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };
  

exports.saveOtp = async (email, otp)=>{
    try {
        await this.addToRedis(email, otp, 600)
    }catch (e) {
        console.log(e)
    }
}

exports.verifyOtp = async (email, body)=>{
    try {
       const realOtp = await this.getValueFromRedis(email)
        if(realOtp !== body){
            return false;
        }else{
            await this.deleteFromRedis(email);
            return true;
        }
    }catch (e) {
        console.log(e);
    }
}

exports.genForgotPasswordToken = async ()=>{
    try {
        return crypto.randomBytes(20).toString('hex')
    }catch (e) {
        console.log(e)
    }
}