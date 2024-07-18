import React, {createContext, useContext, ReactNode} from 'react';
interface AuthContextProps {
  currentUser: any; // Replace `any` with your user type
  isLoggedIn: boolean;
  newUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  phoneNumberAuth: (phone: string) => Promise<any>;
  confirmPhoneAuthCode: (
    confirmationResults: any,
    code: string,
  ) => Promise<void>;
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
