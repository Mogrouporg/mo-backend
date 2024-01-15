const {Schema, model} = require('mongoose');

const houseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
  },
  grossYield: {
    type: Number,
    default: 0,
  },
  capitalAppreciation: {
    type: Number,
    default: 0,
  },
  totalRoi: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    required: true,
  },
  funded: {
    type: Number,
    default: 0,
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  images: [{
    type: String,
  }],
  description: {
    type: String,
  },
  roiPercentage: {
    type: Number,
    default: 0,
  },

}, {
  timestamps: true,
});

const House = model('House', houseSchema);

module.exports = {
  House
}
