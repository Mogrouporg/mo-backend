require('dotenv').config();
const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: process.env.PAYSTACK_PUBLIC_KEY,
    'Content-Type': 'application/json',
    'cache-control': "no-cache"
  },
});
const paystackTest = axios.create({
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

const initializePaymentTest = (form) => {
  return paystackTest.post('/transaction/initialize', form);
}

const verifyPaymentTest = (ref) => {
  return paystackTest.get(`/transaction/verify/${encodeURIComponent(ref)}`);
}

module.exports = {initializePayment, verifyPayment, initializePaymentTest, verifyPaymentTest};
