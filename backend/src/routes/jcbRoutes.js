const express = require('express');
const router = express.Router();
const jcbController = require('../controllers/jcbController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('village').notEmpty().withMessage('Village is required').trim(),
  body('ratePerHour').optional().isNumeric().withMessage('Rate per hour must be a number'),
  body('dailyRate').optional().isNumeric().withMessage('Daily rate must be a number'),
  validateRequest,
  jcbController.createJCB
);

router.get('/', jcbController.getJCBs);
router.get('/:id', jcbController.getJCBById);

router.put('/:id', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('village').optional().trim(),
  body('ratePerHour').optional().isNumeric().withMessage('Rate per hour must be a number'),
  validateRequest,
  jcbController.updateJCB
);

router.delete('/:id', auth, authorize('provider', 'admin', 'super_admin'), jcbController.deleteJCB);

module.exports = router;
