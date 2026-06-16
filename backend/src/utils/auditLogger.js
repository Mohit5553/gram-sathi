const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * Log a security audit event asynchronously
 * @param {Object} params
 * @param {Object} [params.req] - Express request object
 * @param {string|ObjectId} [params.userId] - User performing the action
 * @param {string} params.action - Categorized audit action identifier
 * @param {string} params.details - Human-readable description
 * @param {Object} [params.metadata] - Contextual data
 */
const logAudit = async ({ req, userId, action, details, metadata }) => {
  try {
    let finalUserId = userId;
    let userName = 'Guest/System';
    let userRole = 'guest';

    if (req && req.userData) {
      finalUserId = finalUserId || req.userData.userId || req.userData.id;
      userRole = req.userData.role || userRole;
    }
    if (req && req.user) {
      finalUserId = finalUserId || req.user.id || req.user._id;
      userName = req.user.name || userName;
      userRole = req.user.role || userRole;
    }

    if (finalUserId && (userName === 'Guest/System' || userRole === 'guest')) {
      const dbUser = await User.findById(finalUserId).select('name role');
      if (dbUser) {
        userName = dbUser.name || userName;
        userRole = dbUser.role || userRole;
      }
    }

    let ipAddress = '';
    let userAgent = '';

    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      if (ipAddress && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
      userAgent = req.headers['user-agent'] || '';
    }

    const log = new AuditLog({
      user: finalUserId || null,
      userName,
      userRole,
      action,
      details,
      ipAddress,
      userAgent,
      metadata
    });

    await log.save();
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};

module.exports = {
  logAudit
};
