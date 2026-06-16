/**
 * Middleware to restrict access based on user roles
 * @param {...String} roles - Allowed roles (e.g., 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userData || !roles.includes(req.userData.role)) {
      return res.status(403).json({ 
        message: `Access Denied: Requires one of these roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = authorize;
