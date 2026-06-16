const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const backupManager = require('./utils/backupManager');

const runTest = async () => {
  try {
    console.log('=== STARTING BACKUP & RECOVERY INTEGRATION TEST ===');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/5] Connected to MongoDB successfully.');

    // Ensure we have some test data (e.g. a unique test user)
    const testEmail = 'backup-test-user@example.com';
    await User.deleteMany({ email: testEmail });
    
    const user = new User({
      name: 'Backup Test User',
      email: testEmail,
      role: 'user',
      status: 'active'
    });
    await user.save();
    console.log(`[2/5] Created test user: ${user.name} (${user.email})`);

    // --- TEST 1: CREATE BACKUP ---
    console.log('[3/5] Triggering database backup creation...');
    const backup = await backupManager.createBackup('manual');
    console.log(` -> Backup result status: ${backup.status}`);
    if (backup.status !== 'success') {
      throw new Error(`Backup failed: ${backup.error}`);
    }

    const backupFilePath = path.join(backupManager.BACKUP_DIR, backup.filename);
    console.log(` -> Verification of backup file on disk: ${backupFilePath}`);
    if (!fs.existsSync(backupFilePath)) {
      throw new Error('Backup file does not exist on disk.');
    }
    console.log(`    File size: ${(backup.size / 1024).toFixed(2)} KB`);

    // Verify ledger has record
    const ledger = backupManager.readLedger();
    const ledgerRecord = ledger.find(b => b.filename === backup.filename);
    if (!ledgerRecord) {
      throw new Error('Backup metadata not found in the local ledger.');
    }
    console.log(' -> Backup creation and ledger write verified successfully.');

    // --- TEST 2: RESTORE BACKUP ---
    console.log('[4/5] Testing database restoration...');
    
    // Modify active user so we can verify the restore overwrites it
    user.name = 'Altered User During Backup';
    await user.save();
    console.log(' -> Altered active user name to: "Altered User During Backup"');

    // Run restore
    console.log(` -> Running restore from: ${backup.filename}`);
    const restoreResult = await backupManager.restoreBackup(backup.filename);
    if (!restoreResult.success) {
      throw new Error('Restoration returned failed result.');
    }

    // Query DB and verify user name is restored to "Backup Test User"
    const restoredUser = await User.findOne({ email: testEmail });
    if (!restoredUser) {
      throw new Error('Restored user not found in database.');
    }
    console.log(` -> Fetched restored user name: "${restoredUser.name}" (Expected: "Backup Test User")`);
    if (restoredUser.name !== 'Backup Test User') {
      throw new Error('Restoration failed: Active document name did not roll back to backup state.');
    }
    console.log(' -> Database restoration verified successfully.');

    // --- CLEANUP ---
    console.log('[5/5] Cleaning up backup artifacts...');
    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }
    let updatedLedger = backupManager.readLedger();
    updatedLedger = updatedLedger.filter(b => b.filename !== backup.filename);
    backupManager.writeLedger(updatedLedger);

    await User.deleteOne({ email: testEmail });

    console.log('=== BACKUP & RECOVERY INTEGRATION TEST PASSED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('=== BACKUP & RECOVERY INTEGRATION TEST FAILED ===');
    console.error(error);
    process.exit(1);
  }
};

runTest();
