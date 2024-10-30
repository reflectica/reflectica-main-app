import ReactNativeBiometrics from 'react-native-biometrics';
import EncryptedStorage from 'react-native-encrypted-storage';

// Function to check if biometrics is enabled
export const isBiometricsEnabled = async (): Promise<boolean> => {
  try {
    const biometricsEnabled = await EncryptedStorage.getItem('biometricsEnabled');
    return biometricsEnabled === 'true';
  } catch (error) {
    console.error('Error checking biometrics preference:', error);
    return false;
  }
};

// Function to login with biometrics
export const loginWithBiometrics = async (): Promise<boolean> => {
  const rnBiometrics = new ReactNativeBiometrics();
  const { available } = await rnBiometrics.isSensorAvailable();

  if (available) {
    const result = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate with Biometrics',
      cancelButtonText: 'Cancel',
    });

    if (result.success) {
      console.log('Biometrics authentication successful!');
      return true;
    } else {
      console.log('Biometrics authentication failed');
      return false;
    }
  } else {
    console.log('Biometrics not available on this device');
    return false;
  }
};

// Function to enable biometrics for future logins
export const enableBiometrics = async () => {
  try {
    await EncryptedStorage.setItem('biometricsEnabled', 'true');
    console.log('Biometrics enabled for future logins');
  } catch (error) {
    console.error('Error enabling biometrics:', error);
  }
};
