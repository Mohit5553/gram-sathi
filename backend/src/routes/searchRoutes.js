const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.get('/nearby',
  query('longitude').isNumeric().withMessage('Longitude is required'),
  query('latitude').isNumeric().withMessage('Latitude is required'),
  query('radius').optional().isNumeric(),
  query('serviceType').optional().isIn(['Tractor', 'JCB', 'Labour', 'Electrician', 'Plumber']),
  validateRequest,
  searchController.getNearbyServices
);

module.exports = router;
