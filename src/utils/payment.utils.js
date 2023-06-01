require('dotenv').config();
const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: process.env.PAYSTACK_SECRET_KEY,
    'Content-Type': 'application/json',
    'cache-control': "no-cache"
  },
});

const initializePayment = (form) => {
  return paystack.post('/transaction/initialize', form);
};

const verifyPayment = (ref) => {
  return paystack.get(`/transaction/verify/${encodeURIComponent(ref)}`);
};

module.exports = { initializePayment, verifyPayment };
