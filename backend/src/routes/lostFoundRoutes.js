const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const auth = require('../middleware/auth');
const apicache = require('apicache');
const cache = apicache.middleware;

const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  auth, 
  body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('category').optional().trim(),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('contactName').notEmpty().withMessage('Contact name is required').trim(),
  body('contactNumber').isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
  body('images').optional().isArray(),
  body('status').optional().isIn(['active', 'resolved']),
  validateRequest,
  lostFoundController.createReport
);

router.get('/', cache('5 minutes'), lostFoundController.getReports);
router.get('/:id', cache('5 minutes'), lostFoundController.getReportById);

router.put('/:id', 
  auth, 
  body('type').optional().isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('description').optional().notEmpty().withMessage('Description cannot be empty').trim(),
  body('category').optional().trim(),
  body('location').optional().notEmpty().withMessage('Location cannot be empty').trim(),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('contactName').optional().notEmpty().withMessage('Contact name cannot be empty').trim(),
  body('contactNumber').optional().isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
  body('images').optional().isArray(),
  body('status').optional().isIn(['active', 'resolved']),
  validateRequest,
  lostFoundController.updateReport
);

router.delete('/:id', auth, lostFoundController.deleteReport);

module.exports = router;
