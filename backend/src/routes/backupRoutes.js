const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const backupManager = require('../utils/backupManager');

// Configure Multer storage to save directly to the backups folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, backupManager.BACKUP_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `uploaded-restore-${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow only gz extension
    const ext = path.extname(file.originalname);
    if (ext !== '.gz' && !file.originalname.endsWith('.json.gz')) {
      return cb(new Error('Only compressed backup archives (.json.gz) are allowed'));
    }
    cb(null, true);
  }
});

// GET /api/admin/backups
router.get('/', auth, authorize('super_admin'), adminController.getBackups);

// POST /api/admin/backups
router.post('/', auth, authorize('super_admin'), adminController.triggerManualBackup);

// POST /api/admin/backups/restore/:filename
router.post('/restore/:filename', auth, authorize('super_admin'), adminController.restoreBackupFromFile);

// GET /api/admin/backups/download/:filename
router.get('/download/:filename', auth, authorize('super_admin'), adminController.downloadBackupFile);

// DELETE /api/admin/backups/:filename
router.delete('/:filename', auth, authorize('super_admin'), adminController.deleteBackupFile);

// POST /api/admin/backups/upload
router.post('/upload', auth, authorize('super_admin'), upload.single('backup'), adminController.uploadAndRestoreBackup);

module.exports = router;
