const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 upload requests per 15 minutes
  message: { message: 'Too many upload requests from this IP, please try again after 15 minutes' }
});

// Support up to 5 images at a time
router.post('/', auth, uploadLimiter, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    const urls = req.files.map(file => file.path);
    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete image from Cloudinary
router.delete('/', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL required' });
    
    // Extract public_id from secure URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v12345/gramsathi/sample.jpg
    const splitUrl = url.split('/');
    const publicIdWithExt = splitUrl[splitUrl.length - 1];
    const publicId = `gramsathi/${publicIdWithExt.split('.')[0]}`;
    
    await cloudinary.uploader.destroy(publicId);
    
    res.status(200).json({ message: 'Image deleted from server' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
