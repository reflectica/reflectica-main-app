/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Image, View } from 'react-native';
// import type {PropsWithChildren} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DashboardScreen,
  SessionScreen,
  SettingScreen,
  SupportScreen,
  PostSessionJournal,
} from './src/screens';
import { NotificationScreen, ProfileScreen } from './src/screens/Profile';
import {
  OnboardingScreen,
  PhonenumberScreen,
  LoginScreen,
  EmailLoginScreen,
  SignupScreen,
  VerificationScreen,
  EmailSignupScreen,
} from './src/screens/Auth';
import { SessionDetail, JournalScreen } from './src/screens/Journal';
import { UpdateProfile, NotificationsSetting, PasswordSetting, PrivacySetting} from './src/screens/Settings';
// import {cloud, log, question, setting} from './src/assets/nav';
import cloud from './src/assets/nav/cloud.png'
import log from './src/assets/nav/log.png'
import question from './src/assets/nav/question.png'
import setting from './src/assets/nav/setting.png'
import { useAuth } from './src/context/AuthContext';
import { RootStackParamList } from './src/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const JournalStack = createStackNavigator<RootStackParamList>();
const SettingsStack = createStackNavigator();

function SettingNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="Setting"
        component={SettingScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="ProfileSetting"
        component={UpdateProfile}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="NotificationsSetting"
        component={NotificationsSetting}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="PasswordSetting"
        component={PasswordSetting}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="PrivacySetting"
        component={PrivacySetting}
        options={{ headerShown: false }}
      />
      {/* Add other settings screens here */}
    </SettingsStack.Navigator>
  );
}

function JournalStackNavigator() {
  return (
    <JournalStack.Navigator>
      <JournalStack.Screen
        name="Journal"
        component={JournalScreen}
        options={{ headerShown: false }}
      />
      <JournalStack.Screen
        name="SessionDetail"
        component={SessionDetail}
        options={{ headerShown: false }}
      />
    </JournalStack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          flexDirection: 'row',
          justifyContent: 'center', // Centers the tabs
          alignItems: 'center',
          paddingHorizontal: 20,
        },
        tabBarItemStyle: {
          // Remove flex: 1 to prevent tabs from stretching
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image source={cloud} style={{ height: 30, width: 50 }} />
              {focused && (
                <View
                  style={{
                    marginTop: 2,
                    height: 3,
                    width: 40,
                    backgroundColor: '#5271FF',
                    borderRadius: 1.5,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="JournalTab"
        component={JournalStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image source={log} style={{ height: 30, width: 30, tintColor: color }} />
              {focused && (
                <View
                  style={{
                    marginTop: 2,
                    height: 3,
                    width: 30,
                    backgroundColor: '#5271FF',
                    borderRadius: 1.5,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image source={question} style={{ height: 30, width: 30, tintColor: color }} />
              {focused && (
                <View
                  style={{
                    marginTop: 2,
                    height: 3,
                    width: 30,
                    backgroundColor: '#5271FF',
                    borderRadius: 1.5,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={SettingNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image source={setting} style={{ height: 30, width: 30, tintColor: color }} />
              {focused && (
                <View
                  style={{
                    marginTop: 2,
                    height: 3,
                    width: 30,
                    backgroundColor: '#5271FF',
                    borderRadius: 1.5,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const { isLoggedIn, newUser } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          newUser ? (
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="MainApp"
                component={MyTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InSession"
                component={SessionScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PostSession"
                component={PostSessionJournal}
                options={{ headerShown: false }}
              />
            </>
          )
        ) : (
          <>
            {/* <Stack.Screen
              name="InSession"
              component={SessionScreen}
              options={{headerShown: false}}
            /> 
            <Stack.Screen
              name="MainApp"
              component={MyTabs}
              options={{ headerShown: false }}
            /> */}
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EmailLogin"
              component={EmailLoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EmailSignup"
              component={EmailSignupScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PhoneNumber"
              component={PhonenumberScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notification"
              component={NotificationScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
