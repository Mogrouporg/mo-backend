const {User} = require('../../models/users.model');
const { Admin } = require('../../models/admins.model');
const { Transaction } = require('../../models/transaction.model');


exports.getAllTransactions = async (req, res)=>{
    try {
        const admin = req.admin;
        const transactions = await Transaction.find().select('amount status');
        res.status(200).json({
            _id: admin.id,
            success: true,
            data: transactions
        })
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}