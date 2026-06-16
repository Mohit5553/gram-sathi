const express = require('express');
const router = express.Router();
const electricianController = require('../controllers/electricianController');
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
  electricianController.createElectrician
);

router.get('/', electricianController.getElectricians);
router.get('/:id', electricianController.getElectricianById);

router.put('/:id', 
  auth, 
  authorize('provider', 'admin', 'super_admin'),
  body('village').optional().trim(),
  body('visitCharge').optional().isNumeric(),
  body('experienceYears').optional().isNumeric(),
  validateRequest,
  electricianController.updateElectrician
);

router.delete('/:id', auth, authorize('provider', 'admin', 'super_admin'), electricianController.deleteElectrician);

module.exports = router;
