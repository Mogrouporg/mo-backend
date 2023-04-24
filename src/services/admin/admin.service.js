const {User} = require('../../models/users.model');
const { Admin } = require('../../models/admins.model');
const { Transaction } = require('../../models/transaction.model');
const {imageUpload} = require("../../utils/imageUpload.util");
const {RealEstate} = require("../../models/realEstate.model");
const {notifyAllUsers} = require("../../utils/notifyAllUsers.util");


exports.getAllTransactions = async (req, res)=>{
    try {
        const admin = req.admin;
        const transactions = await Transaction.find().select('amount status -_id').populate('user');
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

exports.getAllUsers = async (req, res)=>{
 try {
     const admin = req.admin;
     const users = await User.find().select('firstName lastName balance status lastTransact');
     res.status(200).json({
         _id: admin.id,
         success: true,
         data: users
     });
 }catch (e) {
     console.log(e)
     res.status(500).json({
         message: "Internal server error"
     })
 }
}

exports.getSingleUser = async (req, res)=>{
    try {
        const admin = req.admin;
        const id = req.params.userId;
        const user = await User.findById(id).select('-password -token -resetPasswordToken');
        res.status(200).json({
            adminId: admin.id,
            success: true,
            data: user
        })
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

exports.createLandInvestment = async (req, res)=>{
    try {
        const email = req.admin.email
        const { name, amount, size, address, location } = req.body;
        //const { images } = req.files;
        if(!name || !amount || !size || !address || !location){
            res.status(400).json({
                message: "All fields are required!"
            })
        }else{
            const urls = [];
            //for(let i=0; i < images.length; i++){
              //  let url = await imageUpload(req.files.images[i], 'realEstate')
               // urls.push(url)
            //}
            const user = await User.find().select('email -_id');
            //console.log(user.email)
            const newRealEstate = new RealEstate({
                user: email,
                propertyName: name,
                amount: amount,
                sizeInSqm: size,
                address: address,
                //image: urls,
                location: location
            })
            await newRealEstate.save();
            console.log(user);
            await notifyAllUsers(user, 'New Set of real Estate Available!', `Get a portion of land for as low as ${amount} with the size of ${size} now!`);
            res.status(201).json({
                success: true,
                data: newRealEstate
            })
        }
    }catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

exports.getAllRealInvestments = async (req, res)=>{
    try {
        const investments = await RealEstate.find().select('propertyName image -_id sizeInSqm');
        res.status({
            success: true,
            data: investments
        })
    }catch (e) {
        console.log(e)
        res.status(200).json({
            message: "Internal Server error"
        })
    }
}

exports.getSingleRealEstate = async (req, res)=>{
    try {
        const _id = req.params.id
        const investment = await RealEstate.findById(_id).select('propertyName image -_id sizeInSqm')
        res.status({
            success: true,
            data: investment
        })
    }catch (e) {
        console.log(e);
    }
}