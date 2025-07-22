import React, {createContext, useContext} from 'react';

export interface SecurityState {
  // Session Management
  isSessionActive: boolean;
  sessionTimeRemaining: number;
  isSessionWarningShown: boolean;
  
  // Authentication Security
  loginAttempts: number;
  isAccountLocked: boolean;
  lockoutTimeRemaining: number;
  requirePasswordChange: boolean;
  
  // MFA State
  isMFAEnabled: boolean;
  isMFARequired: boolean;
  mfaStep: 'none' | 'setup' | 'verify' | 'backup';
  backupCodesRemaining: number;
  
  // Security Questions
  hasSecurityQuestions: boolean;
  securityQuestionStep: 'none' | 'setup' | 'verify';
  
  // Biometric Authentication
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  biometricType: 'none' | 'fingerprint' | 'face' | 'iris';
  
  // Security Events
  lastSecurityEvent: SecurityEvent | null;
  securityAlerts: SecurityAlert[];
}

export interface SecurityEvent {
  type: 'login' | 'logout' | 'lockout' | 'mfa_setup' | 'password_change' | 'session_timeout' | 'biometric_setup';
  timestamp: number;
  details?: any;
}

export interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  dismissed: boolean;
}

export interface SecurityActions {
  // Session Management
  startSession: () => void;
  endSession: () => void;
  extendSession: () => void;
  handleSessionWarning: () => void;
  handleSessionExpired: () => void;
  
  // Authentication Security
  validatePassword: (password: string) => {isValid: boolean; errors: string[]};
  handleLoginAttempt: (identifier: string, success: boolean) => Promise<void>;
  resetLoginAttempts: (identifier: string) => Promise<void>;
  checkAccountLockout: (identifier: string) => Promise<boolean>;
  
  // MFA Management
  enableMFA: () => Promise<boolean>;
  disableMFA: () => Promise<boolean>;
  verifyMFACode: (code: string) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[]>;
  useBackupCode: (code: string) => Promise<boolean>;
  
  // Security Questions
  setupSecurityQuestions: (questions: SecurityQuestion[]) => Promise<boolean>;
  verifySecurityAnswer: (questionId: string, answer: string) => Promise<boolean>;
  
  // Biometric Authentication
  checkBiometricAvailability: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
  
  // Security Events & Alerts
  logSecurityEvent: (event: Omit<SecurityEvent, 'timestamp'>) => void;
  addSecurityAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissSecurityAlert: (alertId: string) => void;
  clearSecurityAlerts: () => void;
  
  // General Security
  clearSensitiveData: () => Promise<void>;
  checkSecurityCompliance: () => Promise<SecurityComplianceReport>;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface SecurityComplianceReport {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
}

export interface SecurityContextType {
  state: SecurityState;
  actions: SecurityActions;
}

const initialSecurityState: SecurityState = {
  // Session Management
  isSessionActive: false,
  sessionTimeRemaining: 0,
  isSessionWarningShown: false,
  
  // Authentication Security
  loginAttempts: 0,
  isAccountLocked: false,
  lockoutTimeRemaining: 0,
  requirePasswordChange: false,
  
  // MFA State
  isMFAEnabled: false,
  isMFARequired: false,
  mfaStep: 'none',
  backupCodesRemaining: 0,
  
  // Security Questions
  hasSecurityQuestions: false,
  securityQuestionStep: 'none',
  
  // Biometric Authentication
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  biometricType: 'none',
  
  // Security Events
  lastSecurityEvent: null,
  securityAlerts: [],
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

export {SecurityContext, initialSecurityState};