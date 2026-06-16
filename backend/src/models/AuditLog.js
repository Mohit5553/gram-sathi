const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userName: { type: String, trim: true, index: true },
  userRole: { type: String, index: true },
  action: { type: String, required: true, index: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Text Index for searching
AuditLogSchema.index({ userName: 'text', action: 'text', details: 'text' });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
