const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const cron = require('node-cron');

const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');
const LEDGER_PATH = path.join(BACKUP_DIR, 'metadata.json');

// Ensure backups directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Ensure metadata ledger exists
if (!fs.existsSync(LEDGER_PATH)) {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify([], null, 2));
}

/**
 * Reads the backup ledger file
 * @returns {Array} List of backup records
 */
const readLedger = () => {
  try {
    const data = fs.readFileSync(LEDGER_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading backup ledger:', error);
    return [];
  }
};

/**
 * Writes to the backup ledger file
 * @param {Array} ledger List of backup records
 */
const writeLedger = (ledger) => {
  try {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
  } catch (error) {
    console.error('Error writing backup ledger:', error);
  }
};

/**
 * Create a new MongoDB backup
 * @param {string} triggerType - 'manual' or 'scheduled'
 * @returns {Promise<Object>} The backup record
 */
const createBackup = async (triggerType = 'manual') => {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${dateStr}.json.gz`;
  const filePath = path.join(BACKUP_DIR, filename);

  const backupRecord = {
    filename,
    timestamp: timestamp.toISOString(),
    size: 0,
    triggerType,
    status: 'failed',
    error: null
  };

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not open');
    }

    // List all active collections in MongoDB
    const collections = await db.listCollections().toArray();
    const backupData = {
      timestamp: timestamp.toISOString(),
      collections: {}
    };

    // Serialize each collection's documents
    for (const collInfo of collections) {
      const collName = collInfo.name;
      // Skip system collections
      if (collName.startsWith('system.')) {
        continue;
      }
      const docs = await db.collection(collName).find({}).toArray();
      backupData.collections[collName] = docs;
    }

    // Compress the JSON stringified data
    const payload = JSON.stringify(backupData);
    const compressed = zlib.gzipSync(payload);

    // Save to disk
    fs.writeFileSync(filePath, compressed);

    // Update metadata record
    backupRecord.size = compressed.length;
    backupRecord.status = 'success';

    console.log(`[BackupManager] Created backup: ${filename} (${(compressed.length / 1024).toFixed(2)} KB)`);
  } catch (error) {
    console.error(`[BackupManager] Backup failed: ${error.message}`);
    backupRecord.status = 'failed';
    backupRecord.error = error.message;
  }

  // Update local file ledger
  const ledger = readLedger();
  ledger.push(backupRecord);
  writeLedger(ledger);

  return backupRecord;
};

/**
 * Restore database from a local backup archive file
 * @param {string} filename - The name of the file in backups folder
 * @returns {Promise<Object>} Result of restoration
 */
const restoreBackup = async (filename) => {
  const filePath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file ${filename} not found`);
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not open');
    }

    // Read compressed file and decompress
    const compressed = fs.readFileSync(filePath);
    const decompressed = zlib.gunzipSync(compressed);
    const backupData = JSON.parse(decompressed.toString('utf8'));

    if (!backupData || !backupData.collections) {
      throw new Error('Invalid backup file structure: missing collections payload');
    }

    // Clear and restore each collection present in the backup
    for (const collName of Object.keys(backupData.collections)) {
      const docs = backupData.collections[collName];
      
      // Clear collection
      await db.collection(collName).deleteMany({});

      // Re-populate if there are documents
      if (docs && docs.length > 0) {
        const formattedDocs = docs.map(deserializeMongoDoc);
        await db.collection(collName).insertMany(formattedDocs);
      }
    }

    console.log(`[BackupManager] Successfully restored database from ${filename}`);
    return { success: true, timestamp: backupData.timestamp };
  } catch (error) {
    console.error(`[BackupManager] Restoration failed: ${error.message}`);
    throw error;
  }
};

/**
 * Helper to deserialize JSON values back to MongoDB BSON types (like Date and ObjectId)
 */
const deserializeMongoDoc = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(deserializeMongoDoc);
  }

  if (typeof obj === 'object') {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      
      // Check for common ISO date patterns
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)) {
        newObj[key] = new Date(val);
      } else if (key === '_id' && typeof val === 'string' && val.length === 24) {
        try {
          const { ObjectId } = require('mongodb');
          newObj[key] = new ObjectId(val);
        } catch (e) {
          newObj[key] = val;
        }
      } else if (typeof val === 'object' && val !== null) {
        newObj[key] = deserializeMongoDoc(val);
      } else {
        newObj[key] = val;
      }
    }
    return newObj;
  }

  return obj;
};

/**
 * Initialize automated scheduled backups
 */
let scheduledJob = null;

const initBackupScheduler = () => {
  if (scheduledJob) {
    console.log('[BackupManager] Scheduler already initialized');
    return;
  }

  // Daily backup at 2:00 AM
  scheduledJob = cron.schedule('0 2 * * *', async () => {
    console.log('[BackupManager] Running scheduled backup...');
    await createBackup('scheduled');
  });

  console.log('[BackupManager] Cron backup scheduler initialized (Daily at 2:00 AM)');
};

module.exports = {
  createBackup,
  restoreBackup,
  initBackupScheduler,
  readLedger,
  writeLedger,
  BACKUP_DIR
};
