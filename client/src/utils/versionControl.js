/**
 * Version Control System for Brain-Agent
 * Manages application versions and rollback capabilities
 */

// Current application version
export const APP_VERSION = '1.0.0';

// Version history tracking
const VERSION_HISTORY = [
  {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    description: 'Initial MVP with basic chat functionality',
    features: ['Chat interface', 'Profile management', 'Basic university features'],
    critical: false
  }
];

/**
 * Version Control Manager
 */
export class VersionManager {
  constructor() {
    this.currentVersion = APP_VERSION;
    this.versionHistory = this.loadVersionHistory();
  }

  /**
   * Load version history from localStorage
   */
  loadVersionHistory() {
    try {
      const saved = localStorage.getItem('version_history');
      return saved ? JSON.parse(saved) : VERSION_HISTORY;
    } catch (error) {
      console.error('Error loading version history:', error);
      return VERSION_HISTORY;
    }
  }

  /**
   * Save version history to localStorage
   */
  saveVersionHistory() {
    try {
      localStorage.setItem('version_history', JSON.stringify(this.versionHistory));
    } catch (error) {
      console.error('Error saving version history:', error);
    }
  }

  /**
   * Create a backup of current application state
   */
  createBackup(version, description) {
    const backup = {
      version,
      timestamp: new Date().toISOString(),
      description,
      data: {
        currentUser: localStorage.getItem('currentUser'),
        conversations: localStorage.getItem('conversations'),
        projects: localStorage.getItem('projects'),
        settings: localStorage.getItem('app_settings')
      }
    };

    try {
      localStorage.setItem(`backup_${version}`, JSON.stringify(backup));
      console.log(`✅ Backup created for version ${version}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create backup for version ${version}:`, error);
      return false;
    }
  }

  /**
   * Restore from a specific version backup
   */
  restoreFromBackup(version) {
    try {
      const backup = localStorage.getItem(`backup_${version}`);
      if (!backup) {
        throw new Error(`No backup found for version ${version}`);
      }

      const backupData = JSON.parse(backup);
      
      // Restore data
      if (backupData.data.currentUser) {
        localStorage.setItem('currentUser', backupData.data.currentUser);
      }
      if (backupData.data.conversations) {
        localStorage.setItem('conversations', backupData.data.conversations);
      }
      if (backupData.data.projects) {
        localStorage.setItem('projects', backupData.data.projects);
      }
      if (backupData.data.settings) {
        localStorage.setItem('app_settings', backupData.data.settings);
      }

      console.log(`✅ Successfully restored from version ${version}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to restore from version ${version}:`, error);
      return false;
    }
  }

  /**
   * Register a new version
   */
  registerVersion(version, description, features = [], critical = false) {
    // Create backup of current state before upgrading
    this.createBackup(this.currentVersion, `Pre-upgrade backup from ${this.currentVersion}`);

    const versionInfo = {
      version,
      timestamp: new Date().toISOString(),
      description,
      features,
      critical,
      previousVersion: this.currentVersion
    };

    this.versionHistory.push(versionInfo);
    this.currentVersion = version;
    this.saveVersionHistory();

    console.log(`📦 Version ${version} registered successfully`);
    return versionInfo;
  }

  /**
   * Get version history
   */
  getVersionHistory() {
    return this.versionHistory;
  }

  /**
   * Get current version info
   */
  getCurrentVersion() {
    return {
      version: this.currentVersion,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if rollback is available
   */
  canRollback() {
    return this.versionHistory.length > 1;
  }

  /**
   * Get available backups
   */
  getAvailableBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('backup_')) {
        const version = key.replace('backup_', '');
        backups.push(version);
      }
    }
    return backups;
  }
}

// Global version manager instance
export const versionManager = new VersionManager();

// Expose for debugging
if (typeof window !== 'undefined') {
  window.versionManager = versionManager;
}