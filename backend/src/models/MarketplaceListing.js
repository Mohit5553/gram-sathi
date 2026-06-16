const mongoose = require('mongoose');

const MarketplaceListingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: String, required: true },
  unit: { type: String, default: '' },
  location: { type: String, required: true },
  imageUrl: { type: String },
  category: { type: String, enum: ['Agriculture', 'Machinery', 'Electronics', 'Others'], required: true, index: true },
  sellerName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

// Text search support
MarketplaceListingSchema.index({ title: 'text', description: 'text' });
MarketplaceListingSchema.index({ category: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('MarketplaceListing', MarketplaceListingSchema);

