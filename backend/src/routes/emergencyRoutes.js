const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/',
  auth,
  authorize('admin', 'super_admin'),
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('category').isIn(['Police', 'Ambulance', 'Fire', 'Electricity', 'Panchayat', 'Hospital', 'Other']).withMessage('Invalid category'),
  body('number').notEmpty().withMessage('Number is required').trim(),
  body('village').optional().trim(),
  body('district').optional().trim(),
  body('address').optional().trim(),
  validateRequest,
  emergencyController.createContact
);

router.get('/', emergencyController.getContacts);

router.put('/:id',
  auth,
  authorize('admin', 'super_admin'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('category').optional().isIn(['Police', 'Ambulance', 'Fire', 'Electricity', 'Panchayat', 'Hospital', 'Other']).withMessage('Invalid category'),
  body('number').optional().notEmpty().withMessage('Number cannot be empty').trim(),
  body('village').optional().trim(),
  body('district').optional().trim(),
  body('address').optional().trim(),
  validateRequest,
  emergencyController.updateContact
);

router.delete('/:id', auth, authorize('admin', 'super_admin'), emergencyController.deleteContact);

module.exports = router;
