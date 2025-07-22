import React, {useState, useEffect, useCallback, ReactNode} from 'react';
import {Alert} from 'react-native';
import {
  SecurityContext,
  SecurityState,
  SecurityActions,
  SecurityEvent,
  SecurityAlert,
  SecurityQuestion,
  SecurityComplianceReport,
  initialSecurityState,
} from '../context/SecurityContext';
import {
  sessionManager,
  loginAttemptManager,
  passwordValidator,
  mfaHelpers,
  secureStorage,
  securityAlerts,
  securityLogger,
} from '../utils/securityHelpers';
import SessionManager from '../utils/sessionManager';

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({children}) => {
  const [securityState, setSecurityState] = useState<SecurityState>(initialSecurityState);

  // Initialize security state on mount
  useEffect(() => {
    initializeSecurityState();
  }, []);

  // Setup session timeout handlers
  useEffect(() => {
    SessionManager.setSessionExpiredCallback(handleSessionExpired);
    SessionManager.setSessionWarningCallback(handleSessionWarning);

    return () => {
      SessionManager.cleanup();
    };
  }, []);

  const initializeSecurityState = async () => {
    try {
      const [isMFAEnabled, hasSecurityQuestions, sessionActive] = await Promise.all([
        mfaHelpers.isMFAEnabled(),
        checkSecurityQuestionsExist(),
        checkSessionActive(),
      ]);

      const backupCodes = await mfaHelpers.getBackupCodes();

      setSecurityState(prev => ({
        ...prev,
        isMFAEnabled,
        hasSecurityQuestions,
        isSessionActive: sessionActive,
        backupCodesRemaining: backupCodes.length,
      }));
    } catch (error) {
      console.error('Error initializing security state:', error);
    }
  };

  const checkSecurityQuestionsExist = async (): Promise<boolean> => {
    try {
      const questions = await secureStorage.get('security_questions');
      return questions !== null;
    } catch (error) {
      return false;
    }
  };

  const checkSessionActive = async (): Promise<boolean> => {
    return !(await sessionManager.isSessionExpired());
  };

  // Session Management Actions
  const startSession = useCallback(() => {
    SessionManager.startSession();
    setSecurityState(prev => ({
      ...prev,
      isSessionActive: true,
      isSessionWarningShown: false,
    }));
  }, []);

  const endSession = useCallback(() => {
    SessionManager.endSession();
    setSecurityState(prev => ({
      ...prev,
      isSessionActive: false,
      sessionTimeRemaining: 0,
      isSessionWarningShown: false,
    }));
  }, []);

  const extendSession = useCallback(() => {
    SessionManager.updateActivity();
    setSecurityState(prev => ({
      ...prev,
      isSessionWarningShown: false,
    }));
  }, []);

  const handleSessionWarning = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      isSessionWarningShown: true,
    }));
    
    SessionManager.getTimeUntilExpiry().then(timeRemaining => {
      setSecurityState(prev => ({
        ...prev,
        sessionTimeRemaining: timeRemaining,
      }));
      securityAlerts.showSessionWarning(timeRemaining);
    });
  }, []);

  const handleSessionExpired = useCallback(() => {
    endSession();
    Alert.alert(
      'Session Expired',
      'Your session has expired due to inactivity. Please log in again.',
      [{text: 'OK'}]
    );
  }, [endSession]);

  // Authentication Security Actions
  const validatePassword = useCallback((password: string) => {
    return passwordValidator.validateComplexity(password);
  }, []);

  const handleLoginAttempt = useCallback(async (identifier: string, success: boolean) => {
    if (success) {
      await loginAttemptManager.resetLoginAttempts(identifier);
      setSecurityState(prev => ({
        ...prev,
        loginAttempts: 0,
        isAccountLocked: false,
        lockoutTimeRemaining: 0,
      }));
    } else {
      const attempts = await loginAttemptManager.incrementLoginAttempts(identifier);
      const maxAttempts = 5; // Could be made configurable
      
      if (attempts >= maxAttempts) {
        await loginAttemptManager.setAccountLockout(identifier);
        const lockoutTime = await loginAttemptManager.getLockoutTimeRemaining(identifier);
        
        setSecurityState(prev => ({
          ...prev,
          loginAttempts: attempts,
          isAccountLocked: true,
          lockoutTimeRemaining: lockoutTime,
        }));
        
        securityAlerts.showAccountLocked(lockoutTime);
        logSecurityEvent({type: 'lockout', details: {identifier, attempts}});
      } else {
        setSecurityState(prev => ({
          ...prev,
          loginAttempts: attempts,
        }));
      }
    }
  }, []);

  const resetLoginAttempts = useCallback(async (identifier: string) => {
    await loginAttemptManager.resetLoginAttempts(identifier);
    setSecurityState(prev => ({
      ...prev,
      loginAttempts: 0,
      isAccountLocked: false,
      lockoutTimeRemaining: 0,
    }));
  }, []);

  const checkAccountLockout = useCallback(async (identifier: string) => {
    const isLocked = await loginAttemptManager.isAccountLocked(identifier);
    if (isLocked) {
      const timeRemaining = await loginAttemptManager.getLockoutTimeRemaining(identifier);
      setSecurityState(prev => ({
        ...prev,
        isAccountLocked: true,
        lockoutTimeRemaining: timeRemaining,
      }));
    }
    return isLocked;
  }, []);

  // MFA Management Actions
  const enableMFA = useCallback(async () => {
    try {
      await mfaHelpers.setMFAEnabled(true);
      const backupCodes = await mfaHelpers.generateBackupCodes();
      
      setSecurityState(prev => ({
        ...prev,
        isMFAEnabled: true,
        backupCodesRemaining: backupCodes.length,
      }));
      
      logSecurityEvent({type: 'mfa_setup', details: {enabled: true}});
      return true;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      return false;
    }
  }, []);

  const disableMFA = useCallback(async () => {
    try {
      await mfaHelpers.setMFAEnabled(false);
      
      setSecurityState(prev => ({
        ...prev,
        isMFAEnabled: false,
        backupCodesRemaining: 0,
        mfaStep: 'none',
      }));
      
      logSecurityEvent({type: 'mfa_setup', details: {enabled: false}});
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return false;
    }
  }, []);

  const verifyMFACode = useCallback(async (code: string) => {
    // This would integrate with actual SMS/TOTP verification
    // For now, simulate verification
    try {
      // In real implementation, this would verify against SMS or TOTP
      const isValid = code.length === 6 && /^\d+$/.test(code);
      
      if (isValid) {
        setSecurityState(prev => ({
          ...prev,
          mfaStep: 'none',
          isMFARequired: false,
        }));
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      return false;
    }
  }, []);

  const generateBackupCodes = useCallback(async () => {
    try {
      const codes = await mfaHelpers.generateBackupCodes();
      setSecurityState(prev => ({
        ...prev,
        backupCodesRemaining: codes.length,
      }));
      return codes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      return [];
    }
  }, []);

  const useBackupCode = useCallback(async (code: string) => {
    try {
      const success = await mfaHelpers.useBackupCode(code);
      if (success) {
        const remainingCodes = await mfaHelpers.getBackupCodes();
        setSecurityState(prev => ({
          ...prev,
          backupCodesRemaining: remainingCodes.length,
          mfaStep: 'none',
          isMFARequired: false,
        }));
      }
      return success;
    } catch (error) {
      console.error('Error using backup code:', error);
      return false;
    }
  }, []);

  // Security Questions Actions
  const setupSecurityQuestions = useCallback(async (questions: SecurityQuestion[]) => {
    try {
      await secureStorage.set('security_questions', JSON.stringify(questions));
      setSecurityState(prev => ({
        ...prev,
        hasSecurityQuestions: true,
        securityQuestionStep: 'none',
      }));
      return true;
    } catch (error) {
      console.error('Error setting up security questions:', error);
      return false;
    }
  }, []);

  const verifySecurityAnswer = useCallback(async (questionId: string, answer: string) => {
    try {
      const questionsJson = await secureStorage.get('security_questions');
      if (!questionsJson) return false;
      
      const questions: SecurityQuestion[] = JSON.parse(questionsJson);
      const question = questions.find(q => q.id === questionId);
      
      if (!question) return false;
      
      // Case-insensitive comparison
      const isCorrect = question.answer.toLowerCase().trim() === answer.toLowerCase().trim();
      
      if (isCorrect) {
        setSecurityState(prev => ({
          ...prev,
          securityQuestionStep: 'none',
        }));
      }
      
      return isCorrect;
    } catch (error) {
      console.error('Error verifying security answer:', error);
      return false;
    }
  }, []);

  // Biometric Authentication Actions (placeholder implementations)
  const checkBiometricAvailability = useCallback(async () => {
    // Would use react-native-touch-id or @react-native-community/biometrics
    // For now, simulate availability
    setSecurityState(prev => ({
      ...prev,
      isBiometricAvailable: true,
      biometricType: 'fingerprint',
    }));
    return true;
  }, []);

  const enableBiometric = useCallback(async () => {
    // Would enable biometric authentication
    setSecurityState(prev => ({
      ...prev,
      isBiometricEnabled: true,
    }));
    logSecurityEvent({type: 'biometric_setup', details: {enabled: true}});
    return true;
  }, []);

  const disableBiometric = useCallback(async () => {
    setSecurityState(prev => ({
      ...prev,
      isBiometricEnabled: false,
    }));
    logSecurityEvent({type: 'biometric_setup', details: {enabled: false}});
    return true;
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    // Would perform biometric authentication
    return true;
  }, []);

  // Security Events & Alerts Actions
  const logSecurityEvent = useCallback((event: Omit<SecurityEvent, 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    setSecurityState(prev => ({
      ...prev,
      lastSecurityEvent: securityEvent,
    }));
    
    securityLogger.logSecurityEvent(securityEvent);
  }, []);

  const addSecurityAlert = useCallback((alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'dismissed'>) => {
    const securityAlert: SecurityAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      dismissed: false,
    };
    
    setSecurityState(prev => ({
      ...prev,
      securityAlerts: [...prev.securityAlerts, securityAlert],
    }));
  }, []);

  const dismissSecurityAlert = useCallback((alertId: string) => {
    setSecurityState(prev => ({
      ...prev,
      securityAlerts: prev.securityAlerts.map(alert =>
        alert.id === alertId ? {...alert, dismissed: true} : alert
      ),
    }));
  }, []);

  const clearSecurityAlerts = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      securityAlerts: [],
    }));
  }, []);

  // General Security Actions
  const clearSensitiveData = useCallback(async () => {
    try {
      await secureStorage.clear();
      await sessionManager.clearSession();
      
      setSecurityState(initialSecurityState);
    } catch (error) {
      console.error('Error clearing sensitive data:', error);
    }
  }, []);

  const checkSecurityCompliance = useCallback(async (): Promise<SecurityComplianceReport> => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check MFA
    if (!securityState.isMFAEnabled) {
      issues.push('Multi-factor authentication is not enabled');
      recommendations.push('Enable MFA for enhanced security');
    }
    
    // Check security questions
    if (!securityState.hasSecurityQuestions) {
      issues.push('Security questions are not set up');
      recommendations.push('Set up security questions for account recovery');
    }
    
    // Check biometric
    if (securityState.isBiometricAvailable && !securityState.isBiometricEnabled) {
      recommendations.push('Consider enabling biometric authentication for convenience');
    }
    
    return {
      isCompliant: issues.length === 0,
      issues,
      recommendations,
    };
  }, [securityState]);

  const actions: SecurityActions = {
    // Session Management
    startSession,
    endSession,
    extendSession,
    handleSessionWarning,
    handleSessionExpired,
    
    // Authentication Security
    validatePassword,
    handleLoginAttempt,
    resetLoginAttempts,
    checkAccountLockout,
    
    // MFA Management
    enableMFA,
    disableMFA,
    verifyMFACode,
    generateBackupCodes,
    useBackupCode,
    
    // Security Questions
    setupSecurityQuestions,
    verifySecurityAnswer,
    
    // Biometric Authentication
    checkBiometricAvailability,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    
    // Security Events & Alerts
    logSecurityEvent,
    addSecurityAlert,
    dismissSecurityAlert,
    clearSecurityAlerts,
    
    // General Security
    clearSensitiveData,
    checkSecurityCompliance,
  };

  const contextValue = {
    state: securityState,
    actions,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};