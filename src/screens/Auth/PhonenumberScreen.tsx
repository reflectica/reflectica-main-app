/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Dimensions,
  TextInput,
  Alert,
  Text,
} from 'react-native';
// import {useDispatch} from 'react-redux';
import {ButtonTemplate} from '../../components/index';
import ModalDropdown from 'react-native-modal-dropdown';
// import {app} from '../../firebase/firebaseConfig';
// import {setConfirmationResult} from '../../features/auth/authSlices';
import {useAuth} from '../../context/AuthContext';

import countryData from '../../data/countryData.json';
import {PhonenumberScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function PhonenumberScreen({
  navigation,
}: PhonenumberScreenProps) {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  // const [confirm, setConfirm] = useState(null);
  // const dispatch = useDispatch();
  const {phoneNumberAuth} = useAuth();

  const countryCodes = countryData.map(country => ({
    label: `${country.flag} (${country.dial_code})`,
    value: country.dial_code,
  }));

  const isValidPhoneNumber = (phone: string) => {
    // Implement your validation logic here
    // For example, you can use a regular expression to check the format
    const phoneRegex = /^\+\d{1,3}\s?\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const sendVerification = async () => {
    // const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const fullPhoneNumber = '+12065555555';

    if (!isValidPhoneNumber(fullPhoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
      return;
    }

    console.log(`Submitted phone number: ${fullPhoneNumber}`);

    try {
      // const appVerifier = recaptchaVerifier.current;
      // const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      const confirmResult = await phoneNumberAuth(fullPhoneNumber);
      // setConfirm(confirmationResult)

      // dispatch(setConfirmationResult(confirmationResult));
      console.log('Confirm:', confirmResult);
      // navigation.navigate('Verification', {
      //     fullPhoneNumber, confirmResult
      //     // confirmationResult
      // });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Failed to sign in with the provided phone number. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView
      style={{
        alignItems: 'center',
        gap: 20,
        flex: 1,
      }}>
      <View style={{alignItems: 'center', width: screenWidth * 0.6}}>
        <Text
          style={{
            fontFamily: 'Montserrat',
            fontWeight: '700',
            fontSize: 34,
            lineHeight: 51,
            color: 'rgba(0, 0, 0, 1)',
          }}>
          Your Number
        </Text>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: 'Montserrat',
            fontWeight: '400',
            fontSize: 18,
            lineHeight: 27,
            color: 'rgba(0, 0, 0, 0.7)',
          }}>
          Enter a valid phone number so we can verify you!
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <ModalDropdown
          options={countryCodes.map(item => item.label)}
          defaultValue={`🇺🇸 (${countryCode})`}
          textStyle={styles.dropdownText}
          dropdownStyle={styles.dropdownContainer}
          onSelect={(index, value) => setCountryCode(value)}
          style={styles.countryCodeContainer}
        />
        <TextInput
          value={phoneNumber}
          keyboardType="phone-pad"
          style={styles.textInput}
          onChangeText={text => setPhoneNumber(text)}
        />
      </View>
      <ButtonTemplate
        title="Continue"
        stylebtn="purple"
        action={sendVerification}
      />

      {/* <FirebaseRecaptchaVerifierModal 
                onLoad={() => console.log('reCAPTCHA Loaded')}
                onError={(error) => console.log('reCAPTCHA Error:', error)}
                ref={ recaptchaVerifier }
                firebaseConfig={ app.options }
                attemptInvisibleVerification={true}
                onVerify={(token) => console.log('CAPTCHA Token:', token)} 
            /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    width: screenWidth * 0.8,
    padding: 15,
  },
  countryCodeContainer: {
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: 'gray',
  },
  dropdownText: {
    padding: 10,
    fontSize: 20,
  },
  dropdownContainer: {
    width: 100,
    fontSize: 25,
  },
  textInput: {
    // flex:1,
    height: screenHeight * 0.02,
    paddingHorizontal: 30,
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: '400',
    lineHeight: 21,
    color: 'rgba(0, 0, 0, 1)',
  },
});
