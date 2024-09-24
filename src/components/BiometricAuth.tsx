import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

const BiometricAuth: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleBiometricAuth = async () => {
    try {
      // Check if biometrics are available
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', 'Biometric authentication is not available on this device');
        return;
      }

      // Prompt user for biometric authentication
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm your identity',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        setIsAuthenticated(true);
        Alert.alert('Authentication Successful', 'You are logged in!');
      } else {
        Alert.alert('Authentication Failed', 'Unable to authenticate');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isAuthenticated ? (
        <Text>Welcome, you are authenticated!</Text>
      ) : (
        <Button title="Authenticate with Biometrics" onPress={handleBiometricAuth} />
      )}
    </View>
  );
};

export default BiometricAuth;
