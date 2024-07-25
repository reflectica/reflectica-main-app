/**
 * @format
 */
import React from 'react';
import {Provider} from 'react-redux';
import {AppRegistry} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/provider/AuthProvider';
import store from './src/features/store';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

const Main = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Main);
