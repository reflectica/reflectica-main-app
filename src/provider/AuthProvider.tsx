import React, {useRef, useState, useCallback, ReactNode, useEffect} from 'react';
import {Alert} from 'react-native';
import {userCollection} from '../firebase/firebaseConfig'; // Import your Firebase authentication instance and Google auth provider
import {addDoc} from 'firebase/firestore';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {AuthContext} from '../context/AuthContext';
import {onAuthStateChanged} from 'firebase/auth';
import Config from "react-native-config";
import { logUserLogin, logUserLogout, logFailedAuth } from '../utils/auditLogger';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

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

  // Initialize session timeout with HIPAA-compliant settings
  const { extendSession } = useSessionTimeout({
    timeoutMinutes: 15, // HIPAA requirement: 15 minutes max
    warningMinutes: 2,  // Warn 2 minutes before timeout
    onTimeout: () => {
      Alert.alert(
        'Session Expired',
        'Your session has expired due to inactivity. Please log in again.',
        [{ text: 'OK' }]
      );
    },
    onWarning: () => {
      Alert.alert(
        'Session Warning',
        'Your session will expire in 2 minutes due to inactivity. Tap OK to extend your session.',
        [
          { text: 'OK', onPress: extendSession },
          { text: 'Logout', onPress: handleLogout }
        ]
      );
    }
  });

  GoogleSignin.configure({
    webClientId: Config.GOOGLE_CLIENT_ID,
    // nonce: 'your_nonce',
  });

  // const signInWithGoogle = useCallback(async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const {idToken} = await GoogleSignin.signIn();
  //     const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  //     const userCredential = await auth().signInWithCredential(
  //       googleCredential,
  //     );
  //     setCurrentUser(userCredential.user);
  //     // console.log("idToken:", idToken)
  //     // console.log('googleCredential', googleCredential)
  //     // console.log("userCredential", userCredential)
  //     // console.log("user", userCredential.user)

  //     // console.log("additionalUserInfo", userCredential.additionalUserInfo.profile)

  //     if (userCredential.additionalUserInfo?.isNewUser) {
  //       console.log('WELCOME NOOBIE!');
  //       setNewUser(true);
  //       const userDocData = {
  //         uid: userCredential.user.uid,
  //         email: userCredential.user.email,
  //         firstname:
  //           userCredential.additionalUserInfo?.profile?.given_name || null,
  //         lastname:
  //           userCredential.additionalUserInfo?.profile?.family_name || null,
  //         imageUrl: userCredential.user?.photoURL || null,
  //       };

  //       try {
  //         addDoc(userCollection, userDocData).then(docRef =>
  //           console.log('Document written with ID:', docRef.id),
  //         );
  //       } catch (error) {
  //         console.error('cannot add new user to firestore:', error);
  //       }
  //     } else {
  //       console.log('WELCOME BACK NOOBIE!');
  //     }

  //     setIsLoggedIn(true);

  //     // return result
  //   } catch (error) {
  //     const typedError = error as {code: string; message: string};

  //     if (typedError.code === statusCodes.SIGN_IN_CANCELLED) {
  //       Alert.alert('Cancel');
  //       console.error('Google Sign-In Cancelled');
  //     } else if (typedError.code === statusCodes.IN_PROGRESS) {
  //       Alert.alert('Signin in progress');
  //       console.error('Sign-In already in progress'); // operation (eg. sign in) already in progress
  //     } else if (typedError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       Alert.alert('PLAY_SERVICES_NOT_AVAILABLE');
  //       console.error('Google Play services not available or outdated'); // play services not available or outdated
  //     } else {
  //       console.error('Non-Google Sign-In Error:', typedError.message); // an error that's not related to google sign in occurred
  //     }
  //   }
  //   return undefined;
  // }, []);

  // const signupWithEmail = useCallback(
  //   async (email: string, password: string) => {
  //     try {
  //       const userCredential = await auth().createUserWithEmailAndPassword(
  //         email,
  //         password,
  //       );
  //       const user = userCredential.user;
  //       setCurrentUser(user);

  //       console.log('WELCOME NEW:', user);

  //       const userDocData = {
  //         uid: user.uid,
  //         email: user.email,
  //       };

  //       try {
  //         addDoc(userCollection, userDocData).then(docRef =>
  //           console.log('Document written with ID:', docRef.id),
  //         );
  //         setNewUser(true);
  //         setIsLoggedIn(true);
  //       } catch (error) {
  //         console.error('cannot add new user to firestore:', error);
  //       }
  //     } catch (error) {
  //       const typedError = error as {code: string; message: string};
  //       console.log(typedError.code + ': ' + typedError.message);
  //       Alert.alert('Error', typedError.message);
  //     }
  //   },
  //   [],
  // );

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );
        const user = userCredential.user;
        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log('WELCOME BACK:', user);
        
        // Log successful login for HIPAA audit trail
        await logUserLogin(user.uid);
      } catch (error) {
        const typedError = error as {code: string; message: string};
        console.log(typedError.code + ': ' + typedError.message);
        
        // Log failed authentication attempt
        await logFailedAuth(email, typedError.message);
        
        Alert.alert('Error', 'Wrong password/email!');
      }
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    const userId = currentUser?.uid;
    
    // Log logout for HIPAA audit trail
    if (userId) {
      await logUserLogout(userId);
    }
    
    // Clear session data
    setCurrentUser(null);
    setIsLoggedIn(false);
    setNewUser(false);
    
    // Sign out from Firebase
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [currentUser]);

  // Monitor Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setNewUser(false);
      }
    });

    return unsubscribe;
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
    extendSession, // Expose session extension for manual user activity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
