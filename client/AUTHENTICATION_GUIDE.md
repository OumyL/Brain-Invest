# 🔐 Authentication & Version Control System

## Overview

This guide covers the new authentication system and version control features added to Brain-Agent while maintaining full backward compatibility with existing functionality.

## 🚀 New Features

### 1. Authentication System
- **JWT-based authentication** (client-side implementation for MVP)
- **Role-based access control** (Student, Teacher, Admin, HR)
- **Backward compatibility** with existing localStorage profiles
- **Session management** with automatic timeout
- **Multi-tab synchronization**

### 2. Version Control & Backup System
- **Automatic backups** before major changes
- **Manual backup creation** for any version
- **One-click rollback** to previous versions
- **Version history tracking** with descriptions
- **Safe restoration** with automatic pre-restore backups

### 3. Comprehensive Logging
- **Authentication events** tracking
- **User actions** logging
- **System errors** monitoring
- **API calls** tracking
- **Security events** logging

## 🔧 Usage

### Authentication

#### For Demo Users (Backward Compatibility)
- Existing users continue to work normally
- Yellow "Demo" badge shows non-authenticated status
- Prompt to upgrade to full authentication

#### For New Users
1. Click "Se connecter / S'inscrire" in sidebar
2. Choose "Créer un compte" for registration
3. Fill in details:
   - **Email**: Any valid email
   - **Password**: Minimum 6 characters
   - **Role**: Select appropriate role
4. Click "Créer le compte"

#### Roles & Permissions
```javascript
STUDENT: 
  - View schedule ✅
  - Request documents ✅
  - Basic chat features ✅

TEACHER:
  - View schedule ✅
  - Manage courses ✅
  - Student tracking ✅

ADMIN:
  - All permissions ✅
  - User management ✅
  - System configuration ✅
  - Version control access ✅

HR:
  - Generate reports ✅
  - Administrative functions ✅
```

### Version Control

#### Access
- **Admin users**: Full access through sidebar "Version & Backup" button
- **Demo users**: Access for testing purposes
- **Other roles**: Restricted access

#### Creating Backups
1. Click "Version & Backup" in sidebar
2. Click "💾 Créer un Backup"
3. Backup is saved automatically with timestamp

#### Restoring Versions
1. Open Version Control panel
2. Select version from dropdown
3. Click "🔄 Restaurer la Version Sélectionnée"
4. Confirm restoration (automatic backup created)
5. Application reloads with restored version

#### Command Line Tools
```bash
# Create backup
npm run backup v1.1.0

# List all backups
npm run list-backups

# Restore specific version
npm run restore v1.0.0

# Update version number
npm run version:update 1.2.0 "New features added"

# Export logs
npm run logs:export
```

## 🛡️ Security Features

### Authentication Security
- **Password validation** (minimum 6 characters)
- **Session timeout** (8 hours)
- **Multi-tab synchronization**
- **Automatic logout** on session expiry
- **Email validation**

### Data Protection
- **Backup before restoration** (prevents data loss)
- **Error logging** for debugging
- **Storage quota management**
- **Input validation** and sanitization

### Access Control
- **Role-based permissions**
- **Feature gating** based on authentication status
- **Admin-only functions** protection

## 🔍 Monitoring & Debugging

### Available Debug Tools
```javascript
// Browser console commands
window.authManager          // Authentication management
window.versionManager       // Version control
window.logger              // Logging system
window.exportLogs()         // Export logs as JSON

// Check authentication status
window.authManager.isUserAuthenticated()

// View recent logs
window.logger.getRecentLogs(10)

// Create manual backup
window.versionManager.createBackup('manual-backup', 'Description')
```

### Log Categories
- **AUTH**: Authentication events
- **USER**: User actions
- **SYSTEM_ERROR**: System errors
- **API**: API calls
- **VERSION**: Version control events
- **SECURITY**: Security events

## 🔄 Migration Path

### Existing Users
1. **No action required** - existing functionality preserved
2. **Optional upgrade** - prompted to authenticate for full features
3. **Seamless transition** - existing data migrated automatically

### New Installations
1. **Start with demo user** - immediate functionality
2. **Authenticate when ready** - unlock all features
3. **Version control available** - from day one

## 🚨 Troubleshooting

### Common Issues

#### Authentication Not Working
```javascript
// Check auth status
window.authManager.isUserAuthenticated()

// Clear auth data and restart
window.authManager.logout()
// Refresh page
```

#### Backup/Restore Issues
```javascript
// List available backups
window.versionManager.getAvailableBackups()

// Emergency restoration
window.versionManager.restoreFromBackup('backup-name')
```

#### Storage Issues
```javascript
// Check storage usage
window.logger.getLogStats()

// Clear logs if needed
window.logger.clearLogs()
```

### Emergency Procedures

#### Complete Reset
```javascript
// In browser console
localStorage.clear()
window.location.reload()
```

#### Manual Backup
```bash
# Create backup before making changes
npm run backup emergency-backup
```

#### Version Rollback
```bash
# Restore to last known good version
npm run restore v1.0.0
```

## 📈 Future Enhancements

### Phase 2 (Server-side Authentication)
- JWT tokens with server validation
- Database-backed user management
- OAuth integration (Google, Microsoft)
- Enhanced security measures

### Phase 3 (Enterprise Features)
- LDAP integration
- SSO support
- Advanced role management
- Audit trails

## 💡 Best Practices

### For Users
1. **Authenticate early** for full features
2. **Create backups** before major changes
3. **Monitor logs** for issues
4. **Use strong passwords** (production)

### For Administrators
1. **Regular backups** of working versions
2. **Monitor authentication logs** for security
3. **Test restorations** in development
4. **Keep version history** clean

## 🎯 Benefits

### Security
- ✅ Protected user data
- ✅ Controlled access to features
- ✅ Audit trail for actions

### Reliability
- ✅ Always recoverable state
- ✅ No breaking changes
- ✅ Comprehensive logging

### User Experience
- ✅ Seamless migration
- ✅ Optional authentication
- ✅ Feature progression