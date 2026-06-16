const mongoose = require('mongoose');

const MandiCacheSchema = new mongoose.Schema({
  cropName: { type: String, required: true, trim: true, index: true },
  marketName: { type: String, required: true, trim: true, index: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  modalPrice: { type: Number, required: true },
  state: { type: String, required: true, trim: true, index: true },
  district: { type: String, required: true, trim: true, index: true },
  date: { type: Date, required: true, index: true }
}, { timestamps: true });

// Compound indexes for searching crops within specific markets
MandiCacheSchema.index({ state: 1, district: 1, cropName: 1 });
MandiCacheSchema.index({ cropName: 'text', marketName: 'text' });

module.exports = mongoose.model('MandiCache', MandiCacheSchema);
