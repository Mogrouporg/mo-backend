const cron = require("node-cron");
const { loanRequest } = require("../models/loanRequests.model");
const { User } = require("../models/users.model");
const { Transaction } = require("../models/transaction.model");

const payLoan = cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Cron started for loan payment");
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Find all approved loans that are due for payment
    const loans = await loanRequest.find({
      status: "approved",
      paid: false,
      dueDate: { $lte: currentDate },
    });

    if (loans.length === 0) {
      console.log("No loans to pay");
      return;
    }

    // Use Promise.all to handle the concurrent operations
    await Promise.all(
      loans.map(async (loan) => {
        const user = await User.findById(loan.user);

        if (user.balance >= loan.amount) {
          user.balance -= loan.amount;
        } else {
          user.totalRoi -= loan.amount;
        }

        // Update user's balance or totalRoi
        await user.save();

        // Mark the loan as paid
        loan.paid = true;
        await loan.save();

        // Create a transaction for the loan payment
        const transaction = new Transaction({
          user: user._id,
          amount: loan.amount,
          status: "Paid",
          type: "Loan"
        });
        await transaction.save();
      })
    );

    console.log("Cron ended for loan payment");
  } catch (error) {
    console.error(error);
  }
});

module.exports = { payLoan };
