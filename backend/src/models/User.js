const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true, minlength: 2, maxlength: 50 },
  mobile: { type: String, unique: true, sparse: true, trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },
  role: { type: String, enum: ['user', 'provider', 'admin', 'super_admin'], default: 'user', index: true },
  permissions: [{ type: String }],
  village: { type: String, trim: true, index: true },
  block: { type: String, trim: true, index: true },
  district: { type: String, trim: true, index: true },
  state: { type: String, trim: true, index: true },
  profileImage: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'blocked', 'inactive', 'banned', 'pending'], default: 'active' },
  otp: { type: String },
  otpExpires: { type: Date },
  refreshToken: { type: String },
  fcmTokens: [{ type: String }],
  notificationPreferences: {
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  bookmarkedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentScheme' }],
  verification: {
    aadhaarCard: { type: String },
    panCard: { type: String },
    status: { 
      type: String, 
      enum: ['unsubmitted', 'pending', 'approved', 'rejected', 'suspended'], 
      default: 'unsubmitted',
      index: true 
    },
    rejectionReason: { type: String },
    verifiedAt: { type: Date }
  },
  providerRating: { type: Number, default: 0 },
  providerRatingCount: { type: Number, default: 0 }
}, { timestamps: true });

// Text Index
UserSchema.index({ name: 'text', village: 'text', block: 'text', district: 'text', state: 'text' });

// Compound Index
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ mobile: 1, status: 1 });
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
