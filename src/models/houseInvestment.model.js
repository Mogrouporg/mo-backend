const {Schema, model} = require('mongoose');
const Investment = require('./investment');

const houseInvestmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  house: {
    type: Schema.Types.ObjectId,
    ref: 'House',
  },
  amount: {
    type: Number,
    default: 0,
  },
  grossYield: {
    type: Number,
    default: 0,
  },
  capitalAppreciation: {
    type: Number,
    default: 0,
  },
  roi: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const HouseInvestment = Investment.discriminator('HouseInvestment', houseInvestmentSchema);

module.exports = {
  HouseInvestment
}

