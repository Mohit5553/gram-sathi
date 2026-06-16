const express = require('express');
const router = express.Router();
const labourController = require('../controllers/labourController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('skillType').isIn(['skilled', 'unskilled', 'semi-skilled']).withMessage('Invalid skill type'),
  body('village').notEmpty().withMessage('Village is required').trim(),
  body('dailyRate').optional().isNumeric().withMessage('Daily rate must be a number'),
  validateRequest,
  labourController.createLabour
);

router.get('/', labourController.getLabours);
router.get('/:id', labourController.getLabourById);

router.put('/:id', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('skillType').optional().isIn(['skilled', 'unskilled', 'semi-skilled']),
  body('village').optional().trim(),
  body('dailyRate').optional().isNumeric(),
  validateRequest,
  labourController.updateLabour
);

router.delete('/:id', auth, authorize('provider', 'admin', 'super_admin'), labourController.deleteLabour);

module.exports = router;
