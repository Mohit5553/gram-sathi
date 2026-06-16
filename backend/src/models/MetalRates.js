const mongoose = require('mongoose');

const MetalRatesSchema = new mongoose.Schema({
  gold24K: { type: Number, required: true },
  gold22K: { type: Number, required: true },
  silver: { type: Number, required: true },
  gold24KChange: { type: Number, default: 0 },
  gold22KChange: { type: Number, default: 0 },
  silverChange: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MetalRates', MetalRatesSchema);
