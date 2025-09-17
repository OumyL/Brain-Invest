#!/usr/bin/env node

/**
 * Backup and Version Control Script for Brain-Agent
 * Creates complete backups of the application state
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');
const VERSION_FILE = path.join(__dirname, '../src/utils/version.json');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a complete backup
 */
function createBackup(version = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupVersion = version || `backup-${timestamp}`;
  const backupPath = path.join(BACKUP_DIR, `${backupVersion}.json`);

  const backup = {
    version: backupVersion,
    timestamp: new Date().toISOString(),
    description: `Backup created at ${new Date().toLocaleString()}`,
    files: {},
    packageJson: null
  };

  // Files to backup
  const filesToBackup = [
    'src/App.jsx',
    'src/context/UserContext.jsx',
    'src/context/ChatContext.jsx',
    'src/context/ThemeContext.jsx',
    'src/context/ProjectContext.jsx',
    'src/services/llmService.js',
    'server/server.js',
    'package.json',
    'README.md'
  ];

  try {
    // Backup main files
    filesToBackup.forEach(filePath => {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        backup.files[filePath] = fs.readFileSync(fullPath, 'utf8');
      }
    });

    // Backup package.json separately for version tracking
    const packageJsonPath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packageJsonPath)) {
      backup.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    }

    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup created: ${backupPath}`);
    console.log(`📦 Version: ${backupVersion}`);
    console.log(`📁 Files backed up: ${Object.keys(backup.files).length}`);

    return backupVersion;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return null;
  }
}

/**
 * Restore from backup
 */
function restoreFromBackup(backupVersion) {
  const backupPath = path.join(BACKUP_DIR, `${backupVersion}.json`);

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup not found: ${backupVersion}`);
    return false;
  }

  try {
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    console.log(`🔄 Restoring from backup: ${backupVersion}`);
    console.log(`📅 Created: ${backup.timestamp}`);

    // Create current backup before restoring
    const currentBackup = createBackup(`pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    if (currentBackup) {
      console.log(`💾 Current state backed up as: ${currentBackup}`);
    }

    // Restore files
    Object.entries(backup.files).forEach(([filePath, content]) => {
      const fullPath = path.join(__dirname, '..', filePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content);
      console.log(`📝 Restored: ${filePath}`);
    });

    console.log(`✅ Restore completed from ${backupVersion}`);
    return true;
  } catch (error) {
    console.error(`❌ Restore failed:`, error.message);
    return false;
  }
}

/**
 * List available backups
 */
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const backup = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        return {
          version: backup.version || file.replace('.json', ''),
          timestamp: backup.timestamp || stats.mtime.toISOString(),
          description: backup.description || 'No description',
          size: `${(stats.size / 1024).toFixed(2)} KB`
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log('📋 Available backups:');
    console.log('');
    files.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.version}`);
      console.log(`   📅 ${new Date(backup.timestamp).toLocaleString()}`);
      console.log(`   📝 ${backup.description}`);
      console.log(`   💾 ${backup.size}`);
      console.log('');
    });

    return files;
  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
    return [];
  }
}

/**
 * Update version information
 */
function updateVersion(newVersion, description = '') {
  const versionInfo = {
    version: newVersion,
    timestamp: new Date().toISOString(),
    description,
    previousBackup: createBackup(`v${newVersion}-pre`)
  };

  try {
    fs.writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));
    console.log(`🏷️  Version updated to: ${newVersion}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update version:', error.message);
    return false;
  }
}

// Command line interface
const command = process.argv[2];
const argument = process.argv[3];

switch (command) {
  case 'backup':
    createBackup(argument);
    break;
    
  case 'restore':
    if (!argument) {
      console.error('❌ Please specify backup version to restore');
      process.exit(1);
    }
    restoreFromBackup(argument);
    break;
    
  case 'list':
    listBackups();
    break;
    
  case 'version':
    if (!argument) {
      console.error('❌ Please specify new version number');
      process.exit(1);
    }
    updateVersion(argument, process.argv[4] || '');
    break;
    
  default:
    console.log('🛠️  Brain-Agent Backup Tool');
    console.log('');
    console.log('Usage:');
    console.log('  node backup.js backup [version]     Create backup');
    console.log('  node backup.js restore <version>    Restore from backup');
    console.log('  node backup.js list                 List all backups');
    console.log('  node backup.js version <version>    Update version');
    console.log('');
    console.log('Examples:');
    console.log('  node backup.js backup v1.1.0');
    console.log('  node backup.js restore v1.0.0');
    console.log('  node backup.js list');
    console.log('  node backup.js version 1.2.0 "Added authentication"');
}

module.exports = {
  createBackup,
  restoreFromBackup,
  listBackups,
  updateVersion
};