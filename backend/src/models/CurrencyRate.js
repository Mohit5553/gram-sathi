const mongoose = require('mongoose');

const CurrencyRateSchema = new mongoose.Schema({
  usdToInr: { type: Number, required: true },
  eurToInr: { type: Number, required: true },
  aedToInr: { type: Number, required: true },
  usdChange: { type: Number, default: 0 },
  eurChange: { type: Number, default: 0 },
  aedChange: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CurrencyRate', CurrencyRateSchema);
