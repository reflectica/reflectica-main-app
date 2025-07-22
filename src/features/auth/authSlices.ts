import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  confirmationResult: any;
  // Security enhancements
  loginAttempts: number;
  isAccountLocked: boolean;
  lockoutUntil: number;
  requirePasswordChange: boolean;
  mfaRequired: boolean;
  mfaEnabled: boolean;
  sessionToken: string | null;
  lastActivity: number;
  securityAlerts: SecurityAlert[];
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface LoginAttemptPayload {
  attempts: number;
  isLocked: boolean;
  lockoutUntil?: number;
}

interface SecurityAlertPayload {
  type: 'warning' | 'error' | 'info';
  message: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  confirmationResult: null,
  // Security enhancements
  loginAttempts: 0,
  isAccountLocked: false,
  lockoutUntil: 0,
  requirePasswordChange: false,
  mfaRequired: false,
  mfaEnabled: false,
  sessionToken: null,
  lastActivity: 0,
  securityAlerts: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<any>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loginAttempts = 0;
      state.isAccountLocked = false;
      state.lockoutUntil = 0;
      state.lastActivity = Date.now();
    },
    logoutUser: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.sessionToken = null;
      state.lastActivity = 0;
      state.mfaRequired = false;
      // Keep security-related state for next login
    },
    setConfirmationResult: (state, action: PayloadAction<any>) => {
      state.confirmationResult = action.payload;
    },
    // Security enhancement actions
    updateLoginAttempts: (state, action: PayloadAction<LoginAttemptPayload>) => {
      state.loginAttempts = action.payload.attempts;
      state.isAccountLocked = action.payload.isLocked;
      if (action.payload.lockoutUntil) {
        state.lockoutUntil = action.payload.lockoutUntil;
      }
    },
    resetLoginAttempts: state => {
      state.loginAttempts = 0;
      state.isAccountLocked = false;
      state.lockoutUntil = 0;
    },
    setAccountLocked: (state, action: PayloadAction<{lockoutUntil: number}>) => {
      state.isAccountLocked = true;
      state.lockoutUntil = action.payload.lockoutUntil;
    },
    setPasswordChangeRequired: (state, action: PayloadAction<boolean>) => {
      state.requirePasswordChange = action.payload;
    },
    setMFARequired: (state, action: PayloadAction<boolean>) => {
      state.mfaRequired = action.payload;
    },
    setMFAEnabled: (state, action: PayloadAction<boolean>) => {
      state.mfaEnabled = action.payload;
    },
    updateSessionToken: (state, action: PayloadAction<string | null>) => {
      state.sessionToken = action.payload;
    },
    updateLastActivity: state => {
      state.lastActivity = Date.now();
    },
    addSecurityAlert: (state, action: PayloadAction<SecurityAlertPayload>) => {
      const alert: SecurityAlert = {
        id: Math.random().toString(36).substr(2, 9),
        type: action.payload.type,
        message: action.payload.message,
        timestamp: Date.now(),
      };
      state.securityAlerts.push(alert);
    },
    removeSecurityAlert: (state, action: PayloadAction<string>) => {
      state.securityAlerts = state.securityAlerts.filter(
        alert => alert.id !== action.payload
      );
    },
    clearSecurityAlerts: state => {
      state.securityAlerts = [];
    },
    // Session timeout action
    expireSession: state => {
      state.isAuthenticated = false;
      state.sessionToken = null;
      state.lastActivity = 0;
      state.mfaRequired = false;
      // Keep user data for re-authentication
    },
  },
});

export const {
  loginUser,
  logoutUser,
  setConfirmationResult,
  updateLoginAttempts,
  resetLoginAttempts,
  setAccountLocked,
  setPasswordChangeRequired,
  setMFARequired,
  setMFAEnabled,
  updateSessionToken,
  updateLastActivity,
  addSecurityAlert,
  removeSecurityAlert,
  clearSecurityAlerts,
  expireSession,
} = authSlice.actions;

export default authSlice.reducer;
