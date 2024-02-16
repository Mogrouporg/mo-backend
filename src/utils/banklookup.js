const axios = require('axios')

exports.banklookup = async (bankCode, account_number) => {
  try {
    const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    )
    return response.data
  } catch (error) {
    return error.message
  }
}

exports.listBanks = async () => {
  try {
    const response = await axios.get('https://api.paystack.co/bank?country=nigeria')
    return response.data.data;
  }
  catch (error) {
    return error.message;
  }
}

