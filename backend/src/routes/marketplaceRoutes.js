const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');

// Public endpoints to search and look up listings
router.get('/', marketplaceController.getListings);
router.get('/:id', marketplaceController.getListingById);

// Authenticated user actions for adding/editing listings
router.post('/', auth, marketplaceController.createListing);
router.put('/:id', auth, marketplaceController.updateListing);
router.delete('/:id', auth, marketplaceController.deleteListing);

module.exports = router;
