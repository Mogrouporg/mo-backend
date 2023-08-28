const cron = require("node-cron");
const { loanRequest } = require("../models/loanRequests.model");
const { User } = require("../models/users.model");
const { Transaction } = require("../models/transaction.model");

const payLoan = cron.schedule("0 0 1 * *", async () => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to midnight to just compare dates

    // Find all approved loans
    const loans = await loanRequest.find({
      status: "approved",
      paid: false,
    });

    const dueLoans = loans.filter((loan) => {
      const loanCreationDate = new Date(loan.createdAt); // Assuming you have a field named `createdAt`
      loanCreationDate.setMonth(loanCreationDate.getMonth() + loan.loanPeriod);
      return loanCreationDate <= currentDate;
    });

    dueLoans.forEach(async (loan) => {
      const user = await User.findById(loan.user);
      if (user.balance >= loan.amount) {
        const balance = user.balance - loan.amount;
        const updatedUser = await User.findByIdAndUpdate(
          loan.user,
          { balance },
          { new: true }
        );
        const updatedLoan = await loanRequest.findByIdAndUpdate(
          loan._id,
          { paid: false },
          { new: true }
        );
        const transaction = new Transaction({
          user: updatedUser._id,
          amount: loan.amount,
          status: "paid",
        });
        await transaction.save();
      } else {
        await loanRequest.findByIdAndUpdate(
          loan._id,
          { paid: false },
          { new: true }
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = { payLoan };
