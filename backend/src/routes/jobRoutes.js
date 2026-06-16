const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public route to view lists or specific details
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Admin route to manage job vacancies
router.post('/', auth, authorize('admin', 'super_admin'), jobController.createJob);
router.put('/:id', auth, authorize('admin', 'super_admin'), jobController.updateJob);
router.delete('/:id', auth, authorize('admin', 'super_admin'), jobController.deleteJob);

module.exports = router;
