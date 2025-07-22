import React from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {sessionManager, securityAlerts, securityLogger, SECURITY_CONSTANTS} from './securityHelpers';

export interface SessionManagerInterface {
  startSession(): void;
  endSession(): void;
  updateActivity(): void;
  checkSession(): Promise<boolean>;
  getTimeUntilExpiry(): Promise<number>;
  handleAppStateChange(nextAppState: AppStateStatus): void;
  setSessionExpiredCallback(callback: () => void): void;
  setSessionWarningCallback(callback: () => void): void;
}

class SessionManagerClass implements SessionManagerInterface {
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private sessionExpiredCallback: (() => void) | null = null;
  private sessionWarningCallback: (() => void) | null = null;
  private isActive = false;
  private lastAppState: AppStateStatus = 'active';

  constructor() {
    // Listen for app state changes
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  startSession(): void {
    this.isActive = true;
    this.updateActivity();
    this.scheduleSessionCheck();
    securityLogger.logSecurityEvent({
      type: 'login',
      details: {sessionStarted: true},
    });
  }

  endSession(): void {
    this.isActive = false;
    this.clearTimers();
    sessionManager.clearSession();
    securityLogger.logSecurityEvent({
      type: 'logout',
      details: {sessionEnded: true},
    });
  }

  updateActivity(): void {
    if (!this.isActive) return;
    
    sessionManager.updateLastActivity();
    this.scheduleSessionCheck();
  }

  async checkSession(): Promise<boolean> {
    if (!this.isActive) return false;
    
    const isExpired = await sessionManager.isSessionExpired();
    if (isExpired) {
      this.handleSessionExpired();
      return false;
    }
    
    return true;
  }

  async getTimeUntilExpiry(): Promise<number> {
    return await sessionManager.getTimeUntilExpiry();
  }

  handleAppStateChange(nextAppState: AppStateStatus): void {
    const prevAppState = this.lastAppState;
    this.lastAppState = nextAppState;

    if (nextAppState === 'active' && prevAppState !== 'active') {
      // App became active, check session validity
      this.checkSessionOnResume();
    } else if (nextAppState !== 'active' && prevAppState === 'active') {
      // App went to background, pause session timers
      this.clearTimers();
    }
  }

  setSessionExpiredCallback(callback: () => void): void {
    this.sessionExpiredCallback = callback;
  }

  setSessionWarningCallback(callback: () => void): void {
    this.sessionWarningCallback = callback;
  }

  private async checkSessionOnResume(): Promise<void> {
    if (!this.isActive) return;
    
    const isExpired = await sessionManager.isSessionExpired();
    if (isExpired) {
      this.handleSessionExpired();
    } else {
      // Resume session timers
      this.scheduleSessionCheck();
    }
  }

  private scheduleSessionCheck(): void {
    this.clearTimers();
    
    if (!this.isActive) return;

    // Schedule warning before timeout
    const warningTime = SECURITY_CONSTANTS.SESSION_TIMEOUT - SECURITY_CONSTANTS.SESSION_WARNING_TIME;
    this.warningTimer = setTimeout(() => {
      this.showSessionWarning();
    }, warningTime);

    // Schedule session timeout
    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, SECURITY_CONSTANTS.SESSION_TIMEOUT);
  }

  private async showSessionWarning(): Promise<void> {
    if (!this.isActive) return;
    
    const timeRemaining = await this.getTimeUntilExpiry();
    if (timeRemaining > 0) {
      if (this.sessionWarningCallback) {
        this.sessionWarningCallback();
      } else {
        securityAlerts.showSessionWarning(timeRemaining);
      }
    }
  }

  private handleSessionExpired(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.clearTimers();
    
    securityLogger.logSecurityEvent({
      type: 'session_timeout',
      details: {reason: 'inactivity'},
    });

    if (this.sessionExpiredCallback) {
      this.sessionExpiredCallback();
    }
  }

  private clearTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // Cleanup method for when the session manager is no longer needed
  cleanup(): void {
    this.clearTimers();
    this.isActive = false;
    // Note: React Native AppState.removeEventListener is deprecated
    // We'll rely on React's useEffect cleanup instead
  }
}

// Singleton instance
export const SessionManager = new SessionManagerClass();

// Auto-activity tracking hook for React components
export const useActivityTracker = () => {
  const trackActivity = () => {
    SessionManager.updateActivity();
  };

  return {trackActivity};
};

// Session timeout hook for React components
export const useSessionTimeout = (
  onSessionExpired: () => void,
  onSessionWarning?: () => void
) => {
  React.useEffect(() => {
    SessionManager.setSessionExpiredCallback(onSessionExpired);
    if (onSessionWarning) {
      SessionManager.setSessionWarningCallback(onSessionWarning);
    }

    return () => {
      SessionManager.setSessionExpiredCallback(() => {});
      SessionManager.setSessionWarningCallback(() => {});
    };
  }, [onSessionExpired, onSessionWarning]);

  const extendSession = () => {
    SessionManager.updateActivity();
  };

  const checkSession = async () => {
    return await SessionManager.checkSession();
  };

  const getTimeRemaining = async () => {
    return await SessionManager.getTimeUntilExpiry();
  };

  return {
    extendSession,
    checkSession,
    getTimeRemaining,
  };
};

export default SessionManager;