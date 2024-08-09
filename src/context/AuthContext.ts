import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {createContext, useContext} from 'react';
interface AuthContextProps {
  currentUser: FirebaseAuthTypes.User | null; // Replace `any` with your user type
  isLoggedIn: boolean;
  newUser: boolean;
  // signInWithGoogle: () => Promise<void>;
  // signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  // phoneNumberAuth: (
  //   phone: string,
  // ) => Promise<FirebaseAuthTypes.ConfirmationResult | null>;
  // confirmPhoneAuthCode: (
  //   confirmationResults: FirebaseAuthTypes.ConfirmationResult,
  //   code: string,
  // ) => Promise<void>;
  handleLogout: () => Promise<void>;
  recaptchaVerifier: any; // Define the type appropriately
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
