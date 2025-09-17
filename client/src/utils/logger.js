/**
 * Comprehensive Logging System for Brain-Agent
 * Tracks authentication, errors, user actions, and system events
 */

// Log levels
export const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  AUTH: 'AUTH',
  USER: 'USER',
  SYSTEM: 'SYSTEM'
};

// Log categories
export const LOG_CATEGORIES = {
  AUTHENTICATION: 'AUTH',
  USER_ACTION: 'USER',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  API_CALL: 'API',
  VERSION_CONTROL: 'VERSION',
  SECURITY: 'SECURITY'
};

/**
 * Logger Class
 */
export class Logger {
  constructor() {
    this.logs = this.loadLogs();
    this.maxLogs = 1000; // Keep last 1000 logs
    this.isEnabled = true;
  }

  /**
   * Load existing logs from localStorage
   */
  loadLogs() {
    try {
      const saved = localStorage.getItem('app_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  }

  /**
   * Save logs to localStorage
   */
  saveLogs() {
    try {
      // Keep only the most recent logs to avoid storage issues
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }

  /**
   * Create a log entry
   */
  createLogEntry(level, category, message, data = null) {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.stringify(data) : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(entry);
    this.saveLogs();

    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = this.getConsoleMethod(level);
      logMethod(`[${level}] [${category}] ${message}`, data || '');
    }

    return entry;
  }

  /**
   * Get appropriate console method for log level
   */
  getConsoleMethod(level) {
    switch (level) {
      case LOG_LEVELS.ERROR:
        return console.error;
      case LOG_LEVELS.WARN:
        return console.warn;
      case LOG_LEVELS.DEBUG:
        return console.debug;
      default:
        return console.log;
    }
  }

  /**
   * Log authentication events
   */
  logAuth(action, userId = null, success = true, details = null) {
    const message = `Authentication: ${action} ${success ? 'succeeded' : 'failed'}`;
    const data = {
      action,
      userId,
      success,
      details,
      ip: 'client-side', // In production, get from server
      timestamp: new Date().toISOString()
    };

    return this.createLogEntry(
      success ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR,
      LOG_CATEGORIES.AUTHENTICATION,
      message,
      data
    );
  }

  /**
   * Log user actions
   */
  logUserAction(action, data = null) {
    return this.createLogEntry(
      LOG_LEVELS.INFO,
      LOG_CATEGORIES.USER_ACTION,
      `User action: ${action}`,
      data
    );
  }

  /**
   * Log system errors
   */
  logError(error, context = null) {
    const message = error.message || 'Unknown error';
    const data = {
      error: error.toString(),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };

    return this.createLogEntry(
      LOG_LEVELS.ERROR,
      LOG_CATEGORIES.SYSTEM_ERROR,
      message,
      data
    );
  }

  /**
   * Log API calls
   */
  logApiCall(method, url, status, duration = null, error = null) {
    const message = `API ${method} ${url} - ${status}`;
    const data = {
      method,
      url,
      status,
      duration,
      error: error ? error.toString() : null,
      timestamp: new Date().toISOString()
    };

    const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    return this.createLogEntry(level, LOG_CATEGORIES.API_CALL, message, data);
  }

  /**
   * Log version control events
   */
  logVersionEvent(action, version, details = null) {
    const message = `Version control: ${action} for version ${version}`;
    const data = {
      action,
      version,
      details,
      timestamp: new Date().toISOString()
    };

    return this.createLogEntry(
      LOG_LEVELS.INFO,
      LOG_CATEGORIES.VERSION_CONTROL,
      message,
      data
    );
  }

  /**
   * Log security events
   */
  logSecurity(event, severity = 'medium', details = null) {
    const message = `Security event: ${event}`;
    const data = {
      event,
      severity,
      details,
      timestamp: new Date().toISOString()
    };

    const level = severity === 'high' ? LOG_LEVELS.ERROR : LOG_LEVELS.WARN;
    return this.createLogEntry(level, LOG_CATEGORIES.SECURITY, message, data);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Get logs within date range
   */
  getLogsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
    return this.createLogEntry(
      LOG_LEVELS.INFO,
      LOG_CATEGORIES.SYSTEM,
      'Logs cleared by user'
    );
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain-agent-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.logUserAction('logs_exported', { totalLogs: this.logs.length });
  }

  /**
   * Get log statistics
   */
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byCategory: {},
      dateRange: {
        oldest: null,
        newest: null
      }
    };

    // Count by level and category
    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    // Date range
    if (this.logs.length > 0) {
      stats.dateRange.oldest = this.logs[0].timestamp;
      stats.dateRange.newest = this.logs[this.logs.length - 1].timestamp;
    }

    return stats;
  }
}

// Global logger instance
export const logger = new Logger();

// Log system startup
logger.createLogEntry(
  LOG_LEVELS.INFO,
  LOG_CATEGORIES.SYSTEM,
  'Brain-Agent logging system initialized'
);

// Expose for debugging
if (typeof window !== 'undefined') {
  window.logger = logger;
  window.exportLogs = () => logger.exportLogs();
}