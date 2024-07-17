import React from 'react';
// import type {PropsWithChildren} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { 
  DashboardScreen, 
  JournalScreen, 
  SignupScreen, 
  NotificationScreen, 
  OnboardingScreen, 
  PhonenumberScreen, 
  ProfileScreen, 
  SessionScreen, 
  SessionDetail,
  VerificationScreen, 
  LoginScreen, 
  EmailLoginScreen, 
  SettingScreen,
  SupportScreen,
  EmailSignupScreen
} from './src/screens';
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
