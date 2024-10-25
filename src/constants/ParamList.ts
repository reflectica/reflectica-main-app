import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Params types passed via route
export type RootStackParamList = {
  Dashboard: undefined;
  Journal: undefined;
  SessionDetail: {session: any; sessionNumber: number};
  Support: undefined;
  Setting: undefined;
  Profile: undefined;
  MainApp: {screen: string};
  InSession: undefined;
  PostSession: {session: any};
  Onboarding: undefined;
  Login: undefined;
  EmailLogin: undefined;
  Signup: undefined;
  EmailSignup: undefined;
  PhoneNumber: undefined;
  Verification: {fullPhoneNumber: string; confirmationResult: any};
  Notification: undefined;
};

export type VerificationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Verification'>;
  route: RouteProp<RootStackParamList, 'Verification'>;
};

export type JournalScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Journal'>;
};

export type DashboardScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export type SignupScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Signup'>;
};

export type NotificationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Notification'>;
};

export type OnboardingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
};

export type PhonenumberScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PhoneNumber'>;
};

export type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

export type SessionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'InSession'>;
};

export type PostSessionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PostSession'>;
  route: RouteProp<RootStackParamList, 'PostSession'>;
};

export type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

export type EmailLoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EmailLogin'>;
};

export type SettingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Setting'>;
};

export type SupportScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Support'>;
};

export type EmailSignupScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EmailSignup'>;
};

export type SessionDetailScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SessionDetail'>;
  route: RouteProp<RootStackParamList, 'SessionDetail'>;
};
