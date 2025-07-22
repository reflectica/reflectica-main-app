import React, {useRef, useState, useCallback, ReactNode, useEffect} from 'react';
import {Alert} from 'react-native';
import {userCollection} from '../firebase/firebaseConfig';
import {addDoc} from 'firebase/firestore';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {AuthContext} from '../context/AuthContext';
import {useSecurityContext} from '../context/SecurityContext';
import {loginAttemptManager, passwordValidator, securityLogger} from '../utils/securityHelpers';
import Config from "react-native-config";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({children}: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<boolean>(false);
  const recaptchaVerifier = useRef(null);
  const {actions: securityActions} = useSecurityContext();

  GoogleSignin.configure({
    webClientId: Config.GOOGLE_CLIENT_ID,
  });

  // Enhanced login with security features
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        // Check account lockout first
        const isLocked = await loginAttemptManager.isAccountLocked(email);
        if (isLocked) {
          const lockoutTime = await loginAttemptManager.getLockoutTimeRemaining(email);
          const minutes = Math.ceil(lockoutTime / 60000);
          Alert.alert(
            'Account Locked',
            `Account is temporarily locked due to too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
          );
          return;
        }

        // Validate password complexity for new passwords (if required)
        const passwordValidation = passwordValidator.validateComplexity(password);
        if (!passwordValidation.isValid) {
          Alert.alert('Password Requirements', passwordValidation.errors.join('\n\n'));
          return;
        }

        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Reset login attempts on successful login
        await loginAttemptManager.resetLoginAttempts(email);
        await securityActions.handleLoginAttempt(email, true);
        
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Start security session
        securityActions.startSession();
        
        // Log security event
        securityLogger.logSecurityEvent({
          type: 'login',
          userId: user.uid,
          details: {method: 'email', timestamp: Date.now()},
        });
        
        console.log('WELCOME BACK:', user);
      } catch (error) {
        const typedError = error as {code: string; message: string};
        console.log(typedError.code + ': ' + typedError.message);
        
        // Handle failed login attempt
        await securityActions.handleLoginAttempt(email, false);
        
        // Log failed attempt
        securityLogger.logSecurityEvent({
          type: 'login',
          details: {
            method: 'email',
            success: false,
            error: typedError.code,
            timestamp: Date.now(),
          },
        });
        
        Alert.alert('Error', 'Wrong password/email!');
      }
    },
    [securityActions],
  );

  // Enhanced logout with security cleanup
  const handleLogout = useCallback(async () => {
    try {
      // End security session
      securityActions.endSession();
      
      // Clear sensitive data
      await securityActions.clearSensitiveData();
      
      // Log security event
      if (currentUser) {
        securityLogger.logSecurityEvent({
          type: 'logout',
          userId: currentUser.uid,
          details: {timestamp: Date.now()},
        });
      }
      
      // Firebase logout
      await auth().signOut();
      
      setCurrentUser(null);
      setIsLoggedIn(false);
      setNewUser(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [currentUser, securityActions]);

  // Setup session timeout handling
  useEffect(() => {
    if (isLoggedIn) {
      // Session timeout will be handled by SecurityProvider
      securityActions.startSession();
    }
  }, [isLoggedIn, securityActions]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user && !isLoggedIn) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        securityActions.startSession();
      } else if (!user && isLoggedIn) {
        handleLogout();
      }
    });

    return unsubscribe;
  }, [isLoggedIn, securityActions, handleLogout]);

  const value = {
    loginWithEmail,
    handleLogout,
    isLoggedIn,
    currentUser,
    newUser,
    recaptchaVerifier,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
