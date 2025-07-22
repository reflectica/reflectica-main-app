import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {Alert} from 'react-native';

// Security constants
export const SECURITY_CONSTANTS = {
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_COMPLEXITY_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  SESSION_WARNING_TIME: 2 * 60 * 1000, // 2 minutes before timeout
};

// Storage keys
const STORAGE_KEYS = {
  SESSION_TOKEN: 'session_token',
  LAST_ACTIVITY: 'last_activity',
  LOGIN_ATTEMPTS: 'login_attempts',
  LOCKOUT_UNTIL: 'lockout_until',
  MFA_ENABLED: 'mfa_enabled',
  BACKUP_CODES: 'backup_codes',
  SECURITY_QUESTIONS: 'security_questions',
  FAILED_ATTEMPTS_LOG: 'failed_attempts_log',
};

// Secure storage functions using Keychain
export const secureStorage = {
  async set(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setInternetCredentials(key, key, value);
      return true;
    } catch (error) {
      console.error('Error storing secure data:', error);
      return false;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await Keychain.resetInternetCredentials({server: key});
      return true;
    } catch (error) {
      console.error('Error removing secure data:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      // Clear all sensitive keys
      const keysToRemove = Object.values(STORAGE_KEYS);
      await Promise.all(keysToRemove.map(key => Keychain.resetInternetCredentials({server: key})));
      return true;
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      return false;
    }
  },
};

// Session management functions
export const sessionManager = {
  async updateLastActivity(): Promise<void> {
    const timestamp = Date.now().toString();
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, timestamp);
  },

  async getLastActivity(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error('Error getting last activity:', error);
      return 0;
    }
  },

  async isSessionExpired(): Promise<boolean> {
    const lastActivity = await this.getLastActivity();
    if (lastActivity === 0) return true;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    return timeSinceLastActivity > SECURITY_CONSTANTS.SESSION_TIMEOUT;
  },

  async getTimeUntilExpiry(): Promise<number> {
    const lastActivity = await this.getLastActivity();
    if (lastActivity === 0) return 0;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    const timeRemaining = SECURITY_CONSTANTS.SESSION_TIMEOUT - timeSinceLastActivity;
    return Math.max(0, timeRemaining);
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SESSION_TOKEN,
      STORAGE_KEYS.LAST_ACTIVITY,
    ]);
  },
};

// Login attempt monitoring
export const loginAttemptManager = {
  async getLoginAttempts(identifier: string): Promise<number> {
    try {
      const attempts = await AsyncStorage.getItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}_${identifier}`);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return 0;
    }
  },

  async incrementLoginAttempts(identifier: string): Promise<number> {
    try {
      const currentAttempts = await this.getLoginAttempts(identifier);
      const newAttempts = currentAttempts + 1;
      await AsyncStorage.setItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}_${identifier}`, newAttempts.toString());
      
      // Log the failed attempt
      await this.logFailedAttempt(identifier);
      
      return newAttempts;
    } catch (error) {
      console.error('Error incrementing login attempts:', error);
      return 0;
    }
  },

  async resetLoginAttempts(identifier: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}_${identifier}`);
      await AsyncStorage.removeItem(`${STORAGE_KEYS.LOCKOUT_UNTIL}_${identifier}`);
    } catch (error) {
      console.error('Error resetting login attempts:', error);
    }
  },

  async setAccountLockout(identifier: string): Promise<void> {
    try {
      const lockoutUntil = Date.now() + SECURITY_CONSTANTS.LOCKOUT_DURATION;
      await AsyncStorage.setItem(`${STORAGE_KEYS.LOCKOUT_UNTIL}_${identifier}`, lockoutUntil.toString());
    } catch (error) {
      console.error('Error setting account lockout:', error);
    }
  },

  async isAccountLocked(identifier: string): Promise<boolean> {
    try {
      const lockoutUntil = await AsyncStorage.getItem(`${STORAGE_KEYS.LOCKOUT_UNTIL}_${identifier}`);
      if (!lockoutUntil) return false;
      
      const lockoutTime = parseInt(lockoutUntil, 10);
      return Date.now() < lockoutTime;
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return false;
    }
  },

  async getLockoutTimeRemaining(identifier: string): Promise<number> {
    try {
      const lockoutUntil = await AsyncStorage.getItem(`${STORAGE_KEYS.LOCKOUT_UNTIL}_${identifier}`);
      if (!lockoutUntil) return 0;
      
      const lockoutTime = parseInt(lockoutUntil, 10);
      const timeRemaining = lockoutTime - Date.now();
      return Math.max(0, timeRemaining);
    } catch (error) {
      console.error('Error getting lockout time remaining:', error);
      return 0;
    }
  },

  async logFailedAttempt(identifier: string): Promise<void> {
    try {
      const logEntry = {
        identifier,
        timestamp: Date.now(),
        ip: 'N/A', // Would need additional package for IP detection
      };
      
      const existingLog = await AsyncStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS_LOG);
      const log = existingLog ? JSON.parse(existingLog) : [];
      log.push(logEntry);
      
      // Keep only last 100 entries
      const trimmedLog = log.slice(-100);
      await AsyncStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS_LOG, JSON.stringify(trimmedLog));
    } catch (error) {
      console.error('Error logging failed attempt:', error);
    }
  },
};

// Password validation
export const passwordValidator = {
  validateComplexity(password: string): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];
    
    if (password.length < SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH} characters long`);
    }
    
    if (!SECURITY_CONSTANTS.PASSWORD_COMPLEXITY_REGEX.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  generateSecurePassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let result = '';
    
    // Ensure at least one character from each required category
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    result += '0123456789'[Math.floor(Math.random() * 10)];
    result += '@$!%*?&'[Math.floor(Math.random() * 7)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the result
    return result.split('').sort(() => Math.random() - 0.5).join('');
  },
};

// MFA helpers
export const mfaHelpers = {
  async isMFAEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.MFA_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  },

  async setMFAEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MFA_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error setting MFA status:', error);
    }
  },

  async generateBackupCodes(): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    
    try {
      await secureStorage.set(STORAGE_KEYS.BACKUP_CODES, JSON.stringify(codes));
    } catch (error) {
      console.error('Error storing backup codes:', error);
    }
    
    return codes;
  },

  async getBackupCodes(): Promise<string[]> {
    try {
      const codes = await secureStorage.get(STORAGE_KEYS.BACKUP_CODES);
      return codes ? JSON.parse(codes) : [];
    } catch (error) {
      console.error('Error retrieving backup codes:', error);
      return [];
    }
  },

  async useBackupCode(code: string): Promise<boolean> {
    try {
      const codes = await this.getBackupCodes();
      const index = codes.indexOf(code.toUpperCase());
      
      if (index === -1) return false;
      
      // Remove the used code
      codes.splice(index, 1);
      await secureStorage.set(STORAGE_KEYS.BACKUP_CODES, JSON.stringify(codes));
      
      return true;
    } catch (error) {
      console.error('Error using backup code:', error);
      return false;
    }
  },
};

// Security alerts
export const securityAlerts = {
  showSessionWarning(timeRemaining: number): void {
    const minutes = Math.ceil(timeRemaining / 60000);
    Alert.alert(
      'Session Warning',
      `Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}. Would you like to continue?`,
      [
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // This will be handled by the SecurityProvider
          },
        },
        {
          text: 'Continue',
          onPress: () => {
            sessionManager.updateLastActivity();
          },
        },
      ]
    );
  },

  showAccountLocked(timeRemaining: number): void {
    const minutes = Math.ceil(timeRemaining / 60000);
    Alert.alert(
      'Account Temporarily Locked',
      `Too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      [{text: 'OK'}]
    );
  },

  showPasswordComplexityError(errors: string[]): void {
    Alert.alert(
      'Password Requirements',
      errors.join('\n\n'),
      [{text: 'OK'}]
    );
  },

  showMFARequired(): void {
    Alert.alert(
      'Multi-Factor Authentication Required',
      'Please complete the multi-factor authentication to access this feature.',
      [{text: 'OK'}]
    );
  },
};

// Security event logging
export const securityLogger = {
  async logSecurityEvent(event: {
    type: 'login' | 'logout' | 'lockout' | 'mfa_setup' | 'password_change' | 'session_timeout' | 'biometric_setup';
    userId?: string;
    details?: any;
  }): Promise<void> {
    try {
      const logEntry = {
        ...event,
        timestamp: Date.now(),
        deviceInfo: 'N/A', // Would need device-info for more details
      };
      
      // For now, just log to console. In production, this should be sent to a secure logging service
      console.log('Security Event:', logEntry);
      
      // Store locally for audit purposes (with size limits)
      const existingLog = await AsyncStorage.getItem('security_events_log');
      const log = existingLog ? JSON.parse(existingLog) : [];
      log.push(logEntry);
      
      // Keep only last 500 entries
      const trimmedLog = log.slice(-500);
      await AsyncStorage.setItem('security_events_log', JSON.stringify(trimmedLog));
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  },
};