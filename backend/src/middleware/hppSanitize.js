/**
 * Custom HTTP Parameter Pollution (HPP) Sanitization Middleware
 * Keeps only the last value of duplicate parameters (arrays) in req.query and req.body,
 * avoiding Parameter Pollution vulnerabilities while staying compatible with Express 5 getters.
 */
const hppSanitizeMiddleware = (req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        // Keep only the last element to prevent pollution
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  if (req.body) {
    for (const key in req.body) {
      if (Array.isArray(req.body[key])) {
        // We only clean basic body inputs, if there are fields expected to be arrays,
        // we can whitelist them. But generally body parameter pollution is less common.
        // For GramSathi, let's whitelist 'images', 'fcmTokens', and 'bookmarkedSchemes'
        // which are legitimately arrays.
        const whitelistedArrays = ['images', 'fcmTokens', 'bookmarkedSchemes'];
        if (!whitelistedArrays.includes(key)) {
          req.body[key] = req.body[key][req.body[key].length - 1];
        }
      }
    }
  }
  next();
};

module.exports = hppSanitizeMiddleware;
