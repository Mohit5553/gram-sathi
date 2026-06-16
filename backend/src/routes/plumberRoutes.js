const express = require('express');
const router = express.Router();
const plumberController = require('../controllers/plumberController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('village').notEmpty().withMessage('Village is required').trim(),
  body('visitCharge').optional().isNumeric().withMessage('Visit charge must be a number'),
  body('experienceYears').optional().isNumeric(),
  validateRequest,
  plumberController.createPlumber
);

router.get('/', plumberController.getPlumbers);
router.get('/:id', plumberController.getPlumberById);

router.put('/:id', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('village').optional().trim(),
  body('visitCharge').optional().isNumeric(),
  body('experienceYears').optional().isNumeric(),
  validateRequest,
  plumberController.updatePlumber
);

router.delete('/:id', auth, authorize('provider', 'admin', 'super_admin'), plumberController.deletePlumber);

module.exports = router;
