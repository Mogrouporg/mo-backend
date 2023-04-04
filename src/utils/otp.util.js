const speakeasy  = require('speakeasy');
const {User} = require('../models/users.model')
const redis = require('redis');
require('dotenv').config();
const {createClient} = require("redis");
const crypto = require("crypto");
const connection = async ()=>{
    try {
        const client = createClient()
        await client.connect();

        client.on('error', (err) => console.log(err));
        client.on('connect', () => console.log('connect'));
        return client;
    }catch (e) {
        console.log(e)
    }
}

const addToRedis = async (key, value, expiresIn) => {
    const redisClient = await connection();
    try {
        return await redisClient.set(key, value, expiresIn);
    } catch (error) {
        console.log(error)
    }
};

const deleteFromRedis = async (key) => {
    const redisClient = await connection();
    try {
        return redisClient.del(key);
    } catch (error) {
        console.log(error)
    }
};

const getValueFromRedis = async (key) => {
    try {
        const redisClient = await connection();
        return redisClient.get(key);
    } catch (error) {
        console.log(error)
    }
};

exports.genOtp = async () => {
    return Math.floor(Math.random() * 1000000)
}

exports.saveOtp = async (email, otp)=>{
    try {
        await addToRedis(email, otp, 600)
    }catch (e) {
        console.log(e)
    }
}

exports.verifyOtp = async (email, body)=>{
    try {
       const realOtp = await getValueFromRedis(email)
        if(realOtp !== body){
            return false;
        }else{
            await deleteFromRedis(email);
            return true;
        }
    }catch (e) {
        console.log(e);
    }
}

exports.genForgotPasswordToken = async ()=>{
    try {
        return crypto.randomBytes(20)
    }catch (e) {
        console.log(e)
    }
}