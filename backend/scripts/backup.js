const { exec } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env');
  process.exit(1);
}

const date = new Date();
const timestamp = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours()}-${date.getMinutes()}`;
const backupDir = path.join(__dirname, '../../backups');
const archivePath = path.join(backupDir, `gramsathi_backup_${timestamp}.gzip`);

// Ensure backup directory exists
const fs = require('fs');
if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir, { recursive: true });
}

console.log(`Starting backup of MongoDB to ${archivePath}...`);

// Use mongodump to create an archive
const cmd = `mongodump --uri="${MONGO_URI}" --archive="${archivePath}" --gzip`;

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`Backup process: ${stderr}`);
  }
  console.log('Database backup successfully completed.');
});
