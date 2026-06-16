const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const providerController = require('../controllers/providerController');

// All provider routes must be protected by auth and authorize
router.use(auth);
router.use(authorize('provider', 'admin', 'super_admin'));

router.get('/dashboard', providerController.getDashboardData);
router.put('/:serviceType/:id/location', providerController.updateLocation);
router.put('/:serviceType/:id/availability', providerController.updateAvailability);

module.exports = router;
