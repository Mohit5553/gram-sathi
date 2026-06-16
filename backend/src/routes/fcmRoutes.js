const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController');
const auth = require('../middleware/auth');

router.post('/token', auth, fcmController.registerToken);
router.post('/token/remove', auth, fcmController.removeToken);

module.exports = router;
