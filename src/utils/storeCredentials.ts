import * as Keychain from 'react-native-keychain';

export const storeCredentials = async (username: string, password: string) => {
  try {
    await Keychain.setGenericPassword(username, password, {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    });
    console.log('Credentials stored successfully');
  } catch (error) {
    console.error('Failed to store credentials', error);
  }
};

export const retrieveCredentials = async () => {
    try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
            console.log("Credentials successfully loaded for user " + credentials.username)
        } else {
            console.log("No credentials stored")
        }
    } catch (error) {
        console.log("Keychain couldn't be accessed!", error);
    }

    await Keychain.resetGenericPassword();
}