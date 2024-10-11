import * as Keychain from 'react-native-keychain';
import { Alert } from 'react-native';

// Function to check if biometric authentication is supported
export const isBiometricSupported = async () => {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    console.log('Biometry Type Detected:', biometryType); // Log the detected biometry type
    return !!biometryType; // Returns true if any biometric type is detected
  } catch (error) {
    console.error('Error checking biometric support:', error); // Logs any errors for deeper debugging
    return false;
  }
};

// Function to save credentials securely with biometric access
export const saveCredentials = async (username: string, password: string) => {
  try {
    await Keychain.setGenericPassword(username, password, {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    Alert.alert('Success', 'Credentials saved securely with biometrics.');
  } catch (error) {
    Alert.alert('Error', 'Failed to save credentials with biometrics.');
  }
};

// Function to authenticate the user with biometrics
export const authenticateWithBiometrics = async () => {
  try {
    console.log("Biometrics triggered...")

    const credentials = await Keychain.getGenericPassword();

    if (credentials) {
      console.log("Credentials found:", credentials)
      Alert.alert('Success', `Logged in as ${credentials.username}`);
      // Additional login actions (e.g., navigating to the main screen) can go here
      return credentials; // Return credentials if needed
    } else {
      console.log("No credentials found.")
      Alert.alert('Error', 'No credentials found.');
      return null;
    }
  } catch (error) {
    console.log("Biometric authentication error:", error)
    Alert.alert('Error', 'Biometric authentication failed.');
    return null;
  }
};
