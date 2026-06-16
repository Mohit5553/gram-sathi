const express = require('express');
const router = express.Router();
const tractorController = require('../controllers/tractorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('tractorType').notEmpty().withMessage('Tractor type is required'),
  body('village').notEmpty().withMessage('Village is required'),
  body('ratePerHour').isNumeric().withMessage('Rate per hour must be a number'),
  validateRequest,
  tractorController.createTractor
);
router.get('/', tractorController.getTractors);
router.get('/:id', tractorController.getTractorById);
router.put('/:id', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('ratePerHour').optional().isNumeric().withMessage('Rate per hour must be a number'),
  validateRequest,
  tractorController.updateTractor
);
router.delete('/:id', auth, authorize('provider', 'admin', 'super_admin'), tractorController.deleteTractor);

module.exports = router;
