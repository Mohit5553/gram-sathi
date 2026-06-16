const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const apicache = require('apicache');
const cache = apicache.middleware;

// Note: Auth middleware needs to parse the token to provide req.userData.role
router.post('/', auth, authorize('admin', 'super_admin'), schemeController.createScheme);
router.get('/', cache('5 minutes'), schemeController.getSchemes);
router.get('/saved', auth, schemeController.getBookmarkedSchemes);
router.get('/:id', cache('5 minutes'), schemeController.getSchemeById);
router.post('/:id/bookmark', auth, schemeController.toggleBookmark);
router.put('/:id', auth, authorize('admin', 'super_admin'), schemeController.updateScheme);
router.delete('/:id', auth, authorize('admin', 'super_admin'), schemeController.deleteScheme);

module.exports = router;
