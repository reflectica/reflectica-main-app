/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Image} from 'react-native';
// import type {PropsWithChildren} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  DashboardScreen,
  SessionScreen,
  SettingScreen,
  SupportScreen,
  PostSessionJournal,
} from './src/screens';
import {NotificationScreen, ProfileScreen} from './src/screens/Profile';
import {
  OnboardingScreen,
  PhonenumberScreen,
  LoginScreen,
  EmailLoginScreen,
  SignupScreen,
  VerificationScreen,
  EmailSignupScreen,
} from './src/screens/Auth';
import {SessionDetail, JournalScreen} from './src/screens/Journal';
// import {cloud, log, question, setting} from './src/assets/nav';
import cloud from './src/assets/nav/cloud.png'
import log from './src/assets/nav/log.png'
import question from './src/assets/nav/question.png'
import setting from './src/assets/nav/setting.png'
import {useAuth} from './src/context/AuthContext';
import {RootStackParamList} from './src/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const JournalStack = createStackNavigator<RootStackParamList>();

function JournalStackNavigator() {
  return (
    <JournalStack.Navigator>
      <JournalStack.Screen
        name="Journal"
        component={JournalScreen}
        options={{headerShown: false}}
      />
      <JournalStack.Screen
        name="SessionDetail"
        component={SessionDetail}
        options={{headerShown: false}}
      />
    </JournalStack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarShowLabel: false,
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({color}) => {
          let iconSource: any;

          if (route.name === 'Dashboard') {
            iconSource = cloud;
          } else if (route.name === 'Journal') {
            iconSource = log;
          } else if (route.name === 'Support') {
            iconSource = question;
          } else if (route.name === 'Setting') {
            iconSource = setting;
          }
          return (
            <Image
              source={iconSource}
              style={{height: 30, width: 30}}
              // color={color}
            />
          );
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Journal"
        component={JournalStackNavigator}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const {isLoggedIn, newUser} = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          newUser ? (
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{headerShown: false}}
            />
          ) : (
            <>
              <Stack.Screen
                name="MainApp"
                component={MyTabs}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="InSession"
                component={SessionScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PostSession"
                component={PostSessionJournal}
                options={{headerShown: false}}
              />
            </>
          )
        ) : (
          <>
            {/* <Stack.Screen
              name="InSession"
              component={SessionScreen}
              options={{headerShown: false}}
            /> */}
            <Stack.Screen
              name="MainApp"
              component={MyTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EmailLogin"
              component={EmailLoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EmailSignup"
              component={EmailSignupScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PhoneNumber"
              component={PhonenumberScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Notification"
              component={NotificationScreen}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
