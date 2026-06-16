const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

/**
 * Log an activity asynchronously
 * @param {Object} params
 * @param {Object} [params.req] - Express request object to extract IP and user-agent
 * @param {string|ObjectId} [params.userId] - The ID of the user performing the action
 * @param {string} params.action - Categorized action identifier
 * @param {string} params.details - Human-readable description
 * @param {Object} [params.metadata] - Additional contextual data
 */
const logActivity = async ({ req, userId, action, details, metadata }) => {
  try {
    let finalUserId = userId;
    let userName = 'Guest/System';
    let userRole = 'guest';

    // Extract user information if req.user or req.userData is populated (e.g. from auth middleware)
    if (req && req.userData) {
      finalUserId = finalUserId || req.userData.userId || req.userData.id;
      userRole = req.userData.role || userRole;
    }
    if (req && req.user) {
      finalUserId = finalUserId || req.user.id || req.user._id;
      userName = req.user.name || userName;
      userRole = req.user.role || userRole;
    }

    // If we have a userId but no userName or userRole, resolve it from DB
    if (finalUserId && (userName === 'Guest/System' || userRole === 'guest')) {
      const dbUser = await User.findById(finalUserId).select('name role');
      if (dbUser) {
        userName = dbUser.name || userName;
        userRole = dbUser.role || userRole;
      }
    }

    // Extract client IP and user agent
    let ipAddress = '';
    let userAgent = '';

    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      if (ipAddress && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
      userAgent = req.headers['user-agent'] || '';
    }

    // Save the log entry asynchronously
    const log = new ActivityLog({
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
    // Prevent logging failures from affecting the main request flow
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  logActivity
};
