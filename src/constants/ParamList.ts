import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

export type RootStackParamList = {
  Dashboard: undefined;
  Journal: undefined;
  SessionDetail: undefined;
  Support: undefined;
  Setting: undefined;
  Profile: undefined;
  MainApp: undefined;
  InSession: undefined;
  Onboarding: undefined;
  Login: undefined;
  EmailLogin: undefined;
  Signup: undefined;
  EmailSignup: undefined;
  PhoneNumber: undefined;
  Verification: {
    fullPhoneNumber: string;
    confirmationResult: any;
  };
  Notification: undefined;
};

type VerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Verification'
>;

type VerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'Verification'
>;

export type NavigationProps = {
  navigation: VerificationScreenNavigationProp;
  route: VerificationScreenRouteProp;
};
