import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import { enableBiometrics, isBiometricsEnabled, loginWithBiometrics } from '../utils/biometrics';

import {Alert} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import Config from "react-native-config";
import EncryptedStorage from 'react-native-encrypted-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {addDoc} from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import {onAuthStateChanged} from 'firebase/auth';
import {userCollection} from '../firebase/firebaseConfig'; // Import your Firebase authentication instance and Google auth provider

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({children}: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null,
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<boolean>(false);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    const initializeAuth = async () => {
      GoogleSignin.configure({
        webClientId: Config.GOOGLE_CLIENT_ID,
        // nonce: 'your_nonce'
      });

      // const biometricsEnabled = await isBiometricsEnabled();
      // if (biometricsEnabled) {
      //   await handleLogin(); // Attempts biometric login first
      // }

      // Subscribe to auth state changes
      const unsubscribe = auth().onAuthStateChanged(user => {
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          console.log("User logged in:", user);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
          console.log("User logged out");
        }
      });

      return unsubscribe; // Unsubscribe on component unmount
    }

    initializeAuth();
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );
        const user = userCredential.user;
        console.log("USER FOR LOGIN WITH EMAIL:", user)

        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log('WELCOME BACK:', user);

        // Check if it's the first login
        // const isFirstLogin = await EncryptedStorage.getItem('firstLogin');
        // if (!isFirstLogin) {
        //   Alert.alert('Would you like to enable biometrics for future logins?');
        //   await EncryptedStorage.setItem('firstLogin', 'false');
        //   await enableBiometrics(); // Enable biometrics for future logins
        // }

      } catch (error) {
        const typedError = error as {code: string; message: string};
        console.log(typedError.code + ': ' + typedError.message);
        Alert.alert('Error', 'Wrong password/email!');
      }
    },
    [],
  );

 // Handle login logic
 const handleLogin = useCallback(async () => {
  const biometricsEnabled = await isBiometricsEnabled();
  if (biometricsEnabled) {
    const success = await loginWithBiometrics();
    if (!success) {
      console.log('Fallback to email/password login');
    }
  } else {
    console.log('Biometrics not enabled, use email/password login.');
    // Fallback to email/password login UI (handled in your login screen)
  }
}, []);

  const handleLogout = useCallback(async () => {
    await auth().signOut();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setNewUser(false);
  }, []);

  const value = {
    // signInWithGoogle,
    // signupWithEmail,
    loginWithEmail,
    // confirmPhoneAuthCode,
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
