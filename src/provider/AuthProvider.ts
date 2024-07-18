import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { fbAuth, db, userCollection, app } from '../firebase/firebaseConfig'; // Import your Firebase authentication instance and Google auth provider
import { addDoc } from "firebase/firestore";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { UserProps } from '../constants';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<UserProps | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [newUser, setNewUser] = useState<boolean>(false)
    const recaptchaVerifier = useRef(null);

    // useEffect(() => {
    //     console.log('AuthProvider mounted or verifier changed:', recaptchaVerifier.current);
    // }, [recaptchaVerifier.current]); 

    GoogleSignin.configure({
        webClientId:process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        nonce: 'your_nonce',
    })

    const signInWithGoogle = useCallback(async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            const userCredential = await auth().signInWithCredential(googleCredential);
            setCurrentUser(userCredential.user)
            // console.log("idToken:", idToken)
            // console.log('googleCredential', googleCredential)
            // console.log("userCredential", userCredential)
            // console.log("user", userCredential.user)

            // console.log("additionalUserInfo", userCredential.additionalUserInfo.profile)


            if (userCredential.additionalUserInfo?.isNewUser) {
                console.log("WELCOME NOOBIE!")
                setNewUser(true)
                const userDocData = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    firstname: userCredential.additionalUserInfo?.profile?.given_name || null,
                    lastname: userCredential.additionalUserInfo?.profile?.family_name || null,
                    imageUrl: userCredential.user?.photoURL || null
                }

                try {
                    addDoc(userCollection, userDocData)
                    .then((docRef) => console.log("Document written with ID:", docRef.id))
                } catch (error) {
                    console.error("cannot add new user to firestore:", error)
                }

            } else {
                console.log("WELCOME BACK NOOBIE!")
            }

            setIsLoggedIn(true);

            // return result
        } catch (error) {
            if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
                alert("Cancel")
                console.log('Google Sign-In Cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                alert("Signin in progress")
                console.log('Sign-In already in progress'); // operation (eg. sign in) already in progress
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                alert('PLAY_SERVICES_NOT_AVAILABLE');
                console.log('Google Play services not available or outdated'); // play services not available or outdated
            } else {
                console.error('Non-Google Sign-In Error:', error.message); // an error that's not related to google sign in occurred
            }
        }
        return undefined;
    }, []);

    const signupWithEmail = useCallback(async (email: string, password: string) => {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password); 
            const user = userCredential.user
            setCurrentUser(user)

            console.log("WELCOME NEW:", user)

            const userDocData = {
                uid: user.uid,
                email: user.email,
            }

            try {
                addDoc(userCollection, userDocData)
                .then((docRef) => console.log("Document written with ID:", docRef.id))
                setNewUser(true)
                setIsLoggedIn(true)
            } catch (error) {
                console.error("cannot add new user to firestore:", error)
            }
        } catch (error) {
            const errorCode = error.errorCode
            const errorMessage = error.message
            console.log(errorCode + ': ' + errorMessage)
            alert(error)
        }
    }, []);

    const loginWithEmail = useCallback(async (email: string, password: string) => {
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password); 
            const user = userCredential.user
            setCurrentUser(user)
            setIsLoggedIn(true)
            console.log("WELCOME BACK:", user)
        } catch (error) {
            const errorCode = error.errorCode
            const errorMessage = error.message
            console.log(errorCode + ': ' + errorMessage)
            alert("Wrong password/email!")
        }
    },[]);

    const phoneNumberAuth = useCallback(async (phone: string) => {
        // console.log("PHONEEE:", phone)

        // if (!recaptchaVerifier.current) {
        //     console.error("Recaptcha Verifier is not set.");
        //     return null;
        // }

        try {
            const confirmationResults = await auth().signInWithPhoneNumber(phone);
            console.log("CONFIRMATION:", confirmationResults)
            return confirmationResults
        } catch (error) {
            console.error("Error phone auth:", error)
            return null
        }
    }, [])

    const confirmPhoneAuthCode = useCallback(async (confirmationResults) => {
        if (!confirmationResults) return
        
        try {
            await confirmationResults.confirm(code)
        } catch (error) {
            console.error("Invalid code:", error)
        }
    }, [])

    const handleLogout = useCallback(async () => {
        setCurrentUser(null)
        setIsLoggedIn(false)
        setNewUser(false)
    }, [])

    const value = {
        signInWithGoogle,
        signupWithEmail,
        loginWithEmail,
        phoneNumberAuth,
        confirmPhoneAuthCode,
        handleLogout,
        isLoggedIn,
        currentUser,
        newUser,
        recaptchaVerifier,
      };

    return (
        <AuthContext.Provider value={value}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
                attemptInvisibleVerification={true}
                onVerify={(token) => console.log('CAPTCHA Token:', token)} 
                onError={(error) => console.log('reCAPTCHA Error:', error)}
            />
            {children}
        </AuthContext.Provider>
    )
}
