import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

export type RootStackParamList = {
  Dashboard: undefined;
  Journal: undefined;
  SessionDetail: {session: any; sessionNumber: number}; // Define params for SessionDetail
  Support: undefined;
  Setting: undefined;
  Profile: undefined;
  MainApp: {screen?: string} | undefined;
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

export type VerificationScreenProps = {
  navigation: VerificationScreenNavigationProp;
  route: VerificationScreenRouteProp;
};

type JournalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Journal'
>;

export type JournalScreenProps = {
  navigation: JournalScreenNavigationProp;
};

// Define types for other screens similarly
type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

export type DashboardScreenProps = {
  navigation: DashboardScreenNavigationProp;
};

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export type SignupScreenProps = {
  navigation: SignupScreenNavigationProp;
};

type NotificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Notification'
>;

export type NotificationScreenProps = {
  navigation: NotificationScreenNavigationProp;
};

export type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export type OnboardingScreenProps = {
  navigation: OnboardingScreenNavigationProp;
};

type PhonenumberScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PhoneNumber'
>;

export type PhonenumberScreenProps = {
  navigation: PhonenumberScreenNavigationProp;
};

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;

export type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
};

type SessionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'InSession'
>;

export type SessionScreenProps = {
  navigation: SessionScreenNavigationProp;
};

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

export type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
};

type EmailLoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EmailLogin'
>;

export type EmailLoginScreenProps = {
  navigation: EmailLoginScreenNavigationProp;
};

type SettingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Setting'
>;

export type SettingScreenProps = {
  navigation: SettingScreenNavigationProp;
};

type SupportScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Support'
>;

export type SupportScreenProps = {
  navigation: SupportScreenNavigationProp;
};

type EmailSignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EmailSignup'
>;

export type EmailSignupScreenProps = {
  navigation: EmailSignupScreenNavigationProp;
};

type SessionDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SessionDetail'
>;

type SessionDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'SessionDetail'
>;

export type SessionDetailScreenProps = {
  navigation: SessionDetailScreenNavigationProp;
  route: SessionDetailScreenRouteProp;
};
