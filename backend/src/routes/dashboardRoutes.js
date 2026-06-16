const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// Public Dashboard Endpoints
router.get('/weather', dashboardController.getWeather);
router.get('/mandi', dashboardController.getMandiRates);
router.get('/metals', dashboardController.getMetalRates);
router.get('/currency', dashboardController.getCurrencyRates);
router.get('/fuel', dashboardController.getFuelRates);
router.get('/announcements', dashboardController.getAnnouncements);

// Admin Dashboard Settings Endpoints
router.get('/admin/announcements', auth, authorize('admin', 'super_admin'), dashboardController.getAnnouncementsAdmin);

router.put('/admin/fuel',
  auth,
  authorize('admin', 'super_admin'),
  body('petrol').isNumeric().withMessage('Petrol price must be a valid number'),
  body('diesel').isNumeric().withMessage('Diesel price must be a valid number'),
  body('cng').isNumeric().withMessage('CNG price must be a valid number'),
  body('lpg').isNumeric().withMessage('LPG price must be a valid number'),
  validateRequest,
  dashboardController.updateFuelRates
);

router.put('/admin/metals',
  auth,
  authorize('admin', 'super_admin'),
  body('gold24K').isNumeric().withMessage('Gold 24K price must be a valid number'),
  body('gold22K').isNumeric().withMessage('Gold 22K price must be a valid number'),
  body('silver').isNumeric().withMessage('Silver price must be a valid number'),
  validateRequest,
  dashboardController.updateMetalRates
);

router.post('/admin/announcements',
  auth,
  authorize('admin', 'super_admin'),
  body('title').notEmpty().withMessage('Title is required').trim().escape(),
  body('content').notEmpty().withMessage('Content is required').trim().escape(),
  body('type').optional().isIn(['notice', 'announcement', 'public_info']).withMessage('Invalid announcement type'),
  body('village').optional().trim().escape(),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  validateRequest,
  dashboardController.createAnnouncement
);

router.put('/admin/announcements/:id',
  auth,
  authorize('admin', 'super_admin'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim().escape(),
  body('content').optional().notEmpty().withMessage('Content cannot be empty').trim().escape(),
  body('type').optional().isIn(['notice', 'announcement', 'public_info']).withMessage('Invalid announcement type'),
  body('village').optional().trim().escape(),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  validateRequest,
  dashboardController.updateAnnouncement
);

router.delete('/admin/announcements/:id', auth, authorize('admin', 'super_admin'), dashboardController.deleteAnnouncement);

module.exports = router;
