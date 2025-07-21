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
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<boolean>(false);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener - SINGLE TIME');
    
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_CLIENT_ID,
    });

    // Single auth state listener
    const unsubscribe = auth().onAuthStateChanged(user => {
      console.log('AuthProvider: Auth state changed:', user ? 'logged in' : 'logged out');
      
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log("User logged in:", user.email);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        console.log("User logged out");
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []); // EMPTY dependency array - this is crucial!

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("USER FOR LOGIN WITH EMAIL:", user);

        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log('WELCOME BACK:', user);
      } catch (error: any) {
        console.log(error.code + ': ' + error.message);
        Alert.alert('Error', 'Wrong password/email!');
      }
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    await auth().signOut();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setNewUser(false);
  }, []);

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