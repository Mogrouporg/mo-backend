const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WithdrawalRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Declined"],
    },
    bankDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String
    },
    transaction:{
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    }
  },
  {
    timestamps: true,
  }
);

const Withdrawals =mongoose.model("WithdrawalRequests", WithdrawalRequestSchema);
module.exports = {
   Withdrawals
}