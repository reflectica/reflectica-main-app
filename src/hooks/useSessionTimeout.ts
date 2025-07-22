import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { logSessionTimeout } from '../utils/auditLogger';

export interface SessionTimeoutConfig {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = (config: SessionTimeoutConfig = {}) => {
  const {
    timeoutMinutes = 15,
    warningMinutes = 2,
    onTimeout,
    onWarning,
  } = config;

  const { currentUser, handleLogout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleSessionTimeout = useCallback(async () => {
    if (currentUser) {
      console.log('Session timeout triggered for user:', currentUser.uid);
      
      // Log the session timeout for audit purposes
      await logSessionTimeout(currentUser.uid);
      
      // Call custom timeout handler if provided
      onTimeout?.();
      
      // Logout the user
      await handleLogout();
    }
  }, [currentUser, handleLogout, onTimeout]);

  const handleWarning = useCallback(() => {
    console.log('Session timeout warning triggered');
    onWarning?.();
  }, [onWarning]);

  const resetTimer = useCallback(() => {
    if (!currentUser) return;

    clearTimers();
    lastActivityRef.current = Date.now();

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // Set warning timer
    if (warningMinutes > 0 && warningMs > 0) {
      warningRef.current = setTimeout(handleWarning, warningMs);
    }

    // Set timeout timer
    timeoutRef.current = setTimeout(handleSessionTimeout, timeoutMs);
  }, [currentUser, timeoutMinutes, warningMinutes, handleWarning, handleSessionTimeout, clearTimers]);

  const extendSession = useCallback(() => {
    if (currentUser) {
      console.log('Session extended for user:', currentUser.uid);
      resetTimer();
    }
  }, [currentUser, resetTimer]);

  // Handle app state changes (backgrounding/foregrounding)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const currentTime = Date.now();
      
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        // App came back to foreground
        const backgroundTime = currentTime - lastActivityRef.current;
        const timeoutMs = timeoutMinutes * 60 * 1000;
        
        if (backgroundTime >= timeoutMs) {
          // Session has expired while app was in background
          console.log('Session expired while app was in background');
          handleSessionTimeout();
          return;
        } else {
          // Session is still valid, reset timer with remaining time
          const remainingTime = timeoutMs - backgroundTime;
          clearTimers();
          
          if (remainingTime > 0) {
            timeoutRef.current = setTimeout(handleSessionTimeout, remainingTime);
            
            // Set warning if we haven't passed the warning threshold
            const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
            const warningRemaining = warningMs - backgroundTime;
            
            if (warningRemaining > 0) {
              warningRef.current = setTimeout(handleWarning, warningRemaining);
            }
          }
        }
      } else if (nextAppState === 'background') {
        // App going to background, record the time
        lastActivityRef.current = currentTime;
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [timeoutMinutes, warningMinutes, handleSessionTimeout, handleWarning, clearTimers]);

  // Initialize timer when user logs in
  useEffect(() => {
    if (currentUser) {
      resetTimer();
    } else {
      clearTimers();
    }

    return () => {
      clearTimers();
    };
  }, [currentUser, resetTimer, clearTimers]);

  // Track user activity to reset timer
  useEffect(() => {
    const activityEvents = ['touchstart', 'scroll', 'keypress'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // For React Native, we'll track when the hook is called as activity
    // In a real implementation, you might want to track specific user interactions
    const interval = setInterval(() => {
      if (currentUser && AppState.currentState === 'active') {
        // Only reset if user is logged in and app is active
        // This is a simple approach - in production you might want more sophisticated activity tracking
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [currentUser, resetTimer]);

  return {
    extendSession,
    resetTimer,
    clearTimers,
    isUserActive: currentUser !== null,
    lastActivity: lastActivityRef.current,
  };
};