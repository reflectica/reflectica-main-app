import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { auditLogger } from '../utils/auditLogger';

interface UseSessionTimeoutProps {
  timeoutDuration?: number; // in milliseconds, default 15 minutes
  onTimeout: () => void;
  userId?: string | null;
  isLoggedIn: boolean;
}

export const useSessionTimeout = ({
  timeoutDuration = 15 * 60 * 1000, // 15 minutes default
  onTimeout,
  userId,
  isLoggedIn,
}: UseSessionTimeoutProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isLoggedIn && userId) {
      timeoutRef.current = setTimeout(async () => {
        await auditLogger.logSessionActivity(userId, 'timeout');
        onTimeout();
      }, timeoutDuration);
    }
  }, [timeoutDuration, onTimeout, userId, isLoggedIn]);

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (appStateRef.current !== nextAppState) {
        if (nextAppState === 'background') {
          // App is going to background
          backgroundTimeRef.current = Date.now();
          clearTimeoutRef();
        } else if (nextAppState === 'active' && appStateRef.current === 'background') {
          // App is coming back from background
          if (backgroundTimeRef.current && isLoggedIn && userId) {
            const timeInBackground = Date.now() - backgroundTimeRef.current;
            
            // If app was in background for more than timeout duration, force logout
            if (timeInBackground >= timeoutDuration) {
              auditLogger.logSessionActivity(userId, 'timeout');
              onTimeout();
              return;
            }
          }
          
          // Reset timeout when app becomes active
          if (isLoggedIn) {
            resetTimeout();
          }
        }
      }
      appStateRef.current = nextAppState;
    },
    [clearTimeoutRef, resetTimeout, timeoutDuration, onTimeout, userId, isLoggedIn]
  );

  // Activity tracker - reset timeout on any activity
  const onActivity = useCallback(() => {
    if (isLoggedIn) {
      resetTimeout();
    }
  }, [resetTimeout, isLoggedIn]);

  useEffect(() => {
    // Set up app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Start timeout if user is logged in
    if (isLoggedIn && userId) {
      resetTimeout();
    }

    return () => {
      subscription?.remove();
      clearTimeoutRef();
    };
  }, [handleAppStateChange, resetTimeout, clearTimeoutRef, isLoggedIn, userId]);

  // Clear timeout when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      clearTimeoutRef();
    }
  }, [isLoggedIn, clearTimeoutRef]);

  return {
    onActivity, // Call this function whenever user interacts with the app
    resetTimeout,
    clearTimeout: clearTimeoutRef,
  };
};