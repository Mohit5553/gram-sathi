const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const jwt = require('jsonwebtoken');

// Custom optional authentication middleware to parse admin context
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', {
        algorithms: ['HS256']
      });
      req.userData = { userId: decoded.userId, role: decoded.role };
    }
  } catch (error) {
    // Fail silently to treat as unauthenticated guest user
  }
  next();
};

// CMS List and Retrieval (Public, but detects Admin role)
router.get('/', optionalAuth, cmsController.getCMSContent);
router.get('/:id', optionalAuth, cmsController.getCMSContentById);

// CMS CRUD Operations (Admin Authorized Only)
router.post('/', auth, authorize('admin', 'super_admin'), cmsController.createCMSContent);
router.put('/:id', auth, authorize('admin', 'super_admin'), cmsController.updateCMSContent);
router.delete('/:id', auth, authorize('admin', 'super_admin'), cmsController.deleteCMSContent);

module.exports = router;
