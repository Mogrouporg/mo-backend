const cron = require("node-cron");
const { loanRequest } = require("../models/loanRequests.model");
const { User } = require("../models/users.model");
const { Transaction } = require("../models/transaction.model");

const payLoan = cron.schedule("0 0 1 * *", async () => {
    try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Find all approved loans
        const loans = await loanRequest.find({
            status: "approved",
            paid: false,
        });

        const dueLoans = loans.filter((loan) => {
            const loanCreationDate = new Date(loan.createdAt);
            loanCreationDate.setMonth(loanCreationDate.getMonth() + loan.loanPeriod);
            return loanCreationDate <= currentDate;
        });

        // Use Promise.all to handle the concurrent operations
        await Promise.all(dueLoans.map(async (loan) => {
            const user = await User.findById(loan.user);
            if (user.balance >= loan.amount) {
                user.balance -= loan.amount;
                await user.save();

                loan.paid = true; // Set the loan to true if it's paid
                await loan.save();

                const transaction = new Transaction({
                    user: user._id,
                    amount: loan.amount,
                    status: "paid",
                });
                await transaction.save();
            }
        }));

    } catch (error) {
        console.error(error);
    }
});

module.exports = { payLoan };
