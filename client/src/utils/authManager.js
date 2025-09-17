/**
 * Authentication Service for Brain-Agent
 * Provides secure authentication without breaking existing functionality
 */

import { logger, LOG_CATEGORIES } from './logger';
import { versionManager } from './versionControl';

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  HR: 'hr'
};

// Role permissions
export const PERMISSIONS = {
  VIEW_SCHEDULE: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
  REQUEST_DOCUMENTS: [USER_ROLES.STUDENT],
  MANAGE_COURSES: [USER_ROLES.TEACHER, USER_ROLES.ADMIN],
  MANAGE_USERS: [USER_ROLES.ADMIN],
  GENERATE_REPORTS: [USER_ROLES.HR, USER_ROLES.ADMIN],
  VIEW_ANALYTICS: [USER_ROLES.ADMIN],
  MANAGE_SYSTEM: [USER_ROLES.ADMIN]
};

/**
 * Authentication Manager
 */
export class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.authToken = null;
    this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
    this.sessionTimer = null;
    
    // Initialize from existing data if available
    this.initializeFromStorage();
    this.setupSessionManagement();
  }

  /**
   * Initialize authentication from existing localStorage data
   * This ensures backward compatibility with existing installations
   */
  initializeFromStorage() {
    try {
      // Check for existing user data (backward compatibility)
      const existingUser = localStorage.getItem('currentUser');
      const authData = localStorage.getItem('auth_data');

      if (authData) {
        // Use new auth system
        const auth = JSON.parse(authData);
        if (this.validateSession(auth)) {
          this.currentUser = auth.user;
          this.authToken = auth.token;
          this.isAuthenticated = true;
          logger.logAuth('session_restored', this.currentUser.id, true);
        } else {
          this.clearAuthData();
        }
      } else if (existingUser) {
        // Migrate existing user to new auth system
        const user = JSON.parse(existingUser);
        this.migrateExistingUser(user);
      }
    } catch (error) {
      logger.logError(error, 'auth_initialization');
      this.clearAuthData();
    }
  }

  /**
   * Migrate existing user to new auth system
   */
  migrateExistingUser(user) {
    try {
      // Create authenticated session for existing user
      const authUser = {
        id: user.id || Date.now().toString(),
        email: user.email || `${user.firstName}.${user.lastName}@comsup.edu`,
        firstName: user.firstName || 'Utilisateur',
        lastName: user.lastName || '',
        role: USER_ROLES.STUDENT, // Default role
        profilePicture: user.profilePicture,
        documents: user.documents || [],
        createdAt: user.createdAt || new Date().toISOString(),
        migratedAt: new Date().toISOString()
      };

      // Generate simple session token
      const token = this.generateSessionToken(authUser);
      
      // Save to new auth system
      this.saveAuthData(authUser, token);
      
      // Set current session
      this.currentUser = authUser;
      this.authToken = token;
      this.isAuthenticated = true;

      logger.logAuth('user_migrated', authUser.id, true, {
        from: 'localStorage_profile',
        to: 'auth_system'
      });

      console.log('✅ Existing user migrated to new auth system');
    } catch (error) {
      logger.logError(error, 'user_migration');
    }
  }

  /**
   * Generate session token (simplified for MVP)
   */
  generateSessionToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + this.sessionTimeout
    };
    
    // In production, use proper JWT with server-side secret
    return btoa(JSON.stringify(payload));
  }

  /**
   * Validate session token
   */
  validateSession(authData) {
    try {
      if (!authData.token || !authData.user) return false;
      
      const payload = JSON.parse(atob(authData.token));
      
      // Check if token is expired
      if (payload.exp < Date.now()) {
        logger.logAuth('session_expired', payload.userId, false);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.logAuth('session_validation_failed', null, false, error.message);
      return false;
    }
  }

  /**
   * Save authentication data with user-specific backup
   */
  saveAuthData(user, token) {
    const authData = {
      user,
      token,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('auth_data', JSON.stringify(authData));
      // Keep backward compatibility
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Save user-specific data for multiple user support
      const userKey = `user_${user.email.replace('@', '_').replace('.', '_')}`;
      localStorage.setItem(userKey, JSON.stringify(user));
    } catch (error) {
      logger.logError(error, 'save_auth_data');
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.authToken = null;
    
    try {
      localStorage.removeItem('auth_data');
      // Don't remove currentUser to maintain backward compatibility
    } catch (error) {
      logger.logError(error, 'clear_auth_data');
    }
    
    this.clearSessionTimer();
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const rawEmail = (email || '').trim();
      const emailLower = rawEmail.toLowerCase();
      logger.logAuth('login_attempt', rawEmail, false);

      // Validate credentials
      if (this.validateCredentials(emailLower, password)) {
        // Check for existing user data to preserve profile info
        const existingUserData = this.getExistingUserData(rawEmail) || this.getExistingUserData(emailLower);
        
        // Determine role from email and reconcile with any existing stored role
        const derivedRole = this.determineRoleFromEmail(emailLower);
        const role = existingUserData?.role && existingUserData.role === derivedRole
          ? existingUserData.role
          : derivedRole;
        
        // Generate automatic codes
        const userCode = this.generateUserCode(emailLower, role);
        
        // Set default academic info for specific users
        let defaultAcademicInfo = {};
        if (email === 'Mounimzad@comsup.edu') {
          defaultAcademicInfo = {
            cycle: 'L3',
            groupe: 'Groupe A',
            niveau: '3ème année',
            studentId: 'STU2024001'
          };
        }
        
        const user = {
          id: existingUserData?.id || Date.now().toString(),
          email: rawEmail,
          firstName: existingUserData?.firstName || this.getFirstNameFromEmail(emailLower),
          lastName: existingUserData?.lastName || this.getLastNameFromEmail(emailLower),
          role,
          userCode, // Add automatic code
          profilePicture: existingUserData?.profilePicture || null,
          documents: existingUserData?.documents || [],
          createdAt: existingUserData?.createdAt || new Date().toISOString(),
          // Preserve academic info if exists
          cycle: existingUserData?.cycle || defaultAcademicInfo.cycle,
          niveau: existingUserData?.niveau || defaultAcademicInfo.niveau,
          groupe: existingUserData?.groupe || defaultAcademicInfo.groupe,
          studentId: existingUserData?.studentId || defaultAcademicInfo.studentId
        };

        const token = this.generateSessionToken(user);
        this.saveAuthData(user, token);
        
        this.currentUser = user;
        this.authToken = token;
        this.isAuthenticated = true;
        
        this.setupSessionTimer();
        
        logger.logAuth('login_success', user.id, true, { role });
        
        return { success: true, user };
      } else {
        logger.logAuth('login_failed', rawEmail, false, 'invalid_credentials');
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
    } catch (error) {
      logger.logError(error, 'login_process');
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate automatic user code based on email and role
   */
  generateUserCode(email, role) {
    const e = (email || '').toLowerCase();
    if (e === 'admin@comsup.edu') {
      return 'ADMIN001'; // Admin code
    }
    
    if (e === 'mounimzad@comsup.edu') {
      return 'STU001'; // Student code for Mounim
    }
    
    if (e === 'mamoun@comsup.edu') {
      return 'PROF001'; // Teacher code
    }
    
    // Generate code based on role
    const timestamp = Date.now().toString().slice(-4);
    switch (role) {
      case USER_ROLES.TEACHER:
        return `PROF${timestamp}`;
      case USER_ROLES.ADMIN:
        return `ADMIN${timestamp}`;
      case USER_ROLES.HR:
        return `HR${timestamp}`;
      default:
        return `STU${timestamp}`;
    }
  }

  /**
   * Get existing user data to preserve profile information
   */
  getExistingUserData(email) {
    try {
      // Check auth data first
      const authData = localStorage.getItem('auth_data');
      if (authData) {
        const auth = JSON.parse(authData);
        if (auth.user && auth.user.email === email) {
          return auth.user;
        }
      }
      
      // Check legacy currentUser data
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.email === email) {
          return user;
        }
      }
      
      // Check for email-specific user data (for multiple user support)
      const userKey = `user_${email.replace('@', '_').replace('.', '_')}`;
      const userData = localStorage.getItem(userKey);
      if (userData) {
        return JSON.parse(userData);
      }
      
      return null;
    } catch (error) {
      logger.logError(error, 'get_existing_user_data');
      return null;
    }
  }

  /**
   * Validate credentials (with specific user validation)
   */
  validateCredentials(email, password) {
    // Specific user credentials
    const emailLower = (email || '').toLowerCase();
    const validUsers = {
      'mounimzad@comsup.edu': 'MoonCOM1', // Student account
      'mamoun@comsup.edu': 'MCOM123', // Teacher account
      'admin@comsup.edu': 'ADMIN123' // Admin account
    };

    // Check for specific users first
    if (validUsers[emailLower]) {
      return validUsers[emailLower] === password;
    }

    // For other emails, accept any @comsup.edu email with password length > 6
    return emailLower.includes('@comsup.edu') && password.length >= 6;
  }

  /**
   * Determine user role based on email
   */
  determineRoleFromEmail(email) {
    const e = (email || '').toLowerCase();
    // Admin users
    if (e === 'admin@comsup.edu') {
      return USER_ROLES.ADMIN;
    }
    
    // Teachers
    if (e === 'mamoun@comsup.edu' || e.includes('prof.') || e.includes('teacher.')) {
      return USER_ROLES.TEACHER;
    }
    
    // HR users
    if (e.includes('hr.') || e.includes('rh.')) {
      return USER_ROLES.HR;
    }
    
    // Default to student for others
    if (e === 'mounimzad@comsup.edu' || e.includes('stu.') || e.includes('etudiant.')) {
      return USER_ROLES.STUDENT;
    }
    
    // Default to student for all other @comsup.edu emails
    return USER_ROLES.STUDENT;
  }

  /**
   * Extract first name from email
   */
  getFirstNameFromEmail(email) {
    const e = (email || '').toLowerCase();
    if (e === 'mounimzad@comsup.edu') {
      return 'Mounim';
    }
    
    if (e === 'mamoun@comsup.edu') {
      return 'Mamoun';
    }
    
    if (e === 'admin@comsup.edu') {
      return 'Administrateur';
    }
    
    const localPart = email.split('@')[0];
    if (localPart.includes('.')) {
      return localPart.split('.')[0] || 'Utilisateur';
    }
    
    return localPart || 'Utilisateur';
  }

  /**
   * Extract last name from email
   */
  getLastNameFromEmail(email) {
    const e = (email || '').toLowerCase();
    if (e === 'mounimzad@comsup.edu') {
      return 'Zad';
    }
    
    if (e === 'mamoun@comsup.edu') {
      return 'Iraqi'; 
    }
    
    if (e === 'admin@comsup.edu') {
      return 'Système';
    }
    
    const localPart = email.split('@')[0];
    if (localPart.includes('.')) {
      return localPart.split('.')[1] || '';
    }
    
    return '';
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      logger.logAuth('register_attempt', userData.email, false);

      // Validate required fields
      if (!userData.email || !userData.password || !userData.firstName) {
        throw new Error('Missing required fields');
      }

      const user = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        role: userData.role || USER_ROLES.STUDENT,
        profilePicture: null,
        documents: [],
        createdAt: new Date().toISOString()
      };

      const token = this.generateSessionToken(user);
      this.saveAuthData(user, token);
      
      this.currentUser = user;
      this.authToken = token;
      this.isAuthenticated = true;
      
      this.setupSessionTimer();
      
      logger.logAuth('register_success', user.id, true);
      
      return { success: true, user };
    } catch (error) {
      logger.logError(error, 'registration_process');
      logger.logAuth('register_failed', userData.email, false, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  logout() {
    logger.logAuth('logout', this.currentUser?.id, true);
    this.clearAuthData();
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission) {
    if (!this.isAuthenticated || !this.currentUser) return false;
    return PERMISSIONS[permission]?.includes(this.currentUser.role) || false;
  }

  /**
   * Get user role
   */
  getUserRole() {
    return this.currentUser?.role || null;
  }

  /**
   * Update user profile
   */
  updateProfile(updates) {
    if (!this.isAuthenticated) return false;
    
    try {
      this.currentUser = { ...this.currentUser, ...updates };
      const token = this.generateSessionToken(this.currentUser);
      this.saveAuthData(this.currentUser, token);
      
      logger.logAuth('profile_updated', this.currentUser.id, true);
      return true;
    } catch (error) {
      logger.logError(error, 'profile_update');
      return false;
    }
  }

  /**
   * Setup session management
   */
  setupSessionManagement() {
    this.setupSessionTimer();
    
    // Listen for storage changes (multi-tab synchronization)
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_data') {
        this.handleStorageChange(e);
      }
    });
  }

  /**
   * Setup session timer
   */
  setupSessionTimer() {
    this.clearSessionTimer();
    
    if (this.isAuthenticated) {
      this.sessionTimer = setTimeout(() => {
        logger.logAuth('session_timeout', this.currentUser?.id, false);
        this.logout();
        alert('Your session has expired. Please log in again.');
      }, this.sessionTimeout);
    }
  }

  /**
   * Clear session timer
   */
  clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Handle storage changes (multi-tab sync)
   */
  handleStorageChange(event) {
    if (event.key === 'auth_data') {
      if (event.newValue) {
        // Auth data updated in another tab
        this.initializeFromStorage();
      } else {
        // Auth data cleared in another tab
        this.clearAuthData();
      }
    }
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check authentication status
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }
}

// Global auth manager instance
export const authManager = new AuthManager();

// Expose for debugging
if (typeof window !== 'undefined') {
  window.authManager = authManager;
}
