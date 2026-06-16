const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/hierarchy', locationController.getHierarchy);
router.get('/search', locationController.searchLocations);
router.get('/availability', locationController.getAvailability);

module.exports = router;
