const mongoose = require('mongoose');

const FuelRatesSchema = new mongoose.Schema({
  petrol: { type: Number, required: true },
  diesel: { type: Number, required: true },
  cng: { type: Number, required: true },
  lpg: { type: Number, required: true },
  state: { type: String, default: 'Uttar Pradesh', index: true },
  district: { type: String, default: 'Gonda', index: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FuelRates', FuelRatesSchema);
