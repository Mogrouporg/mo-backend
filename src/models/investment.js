const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
}, {
    discriminatorKey: 'investmentType',
    timestamps: true,
});

const Investment = mongoose.model('investment', investmentSchema);

module.exports = Investment;