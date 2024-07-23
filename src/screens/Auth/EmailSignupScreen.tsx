/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import {ButtonTemplate} from '../../components';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {useAuth} from '../../context/AuthContext';
import {EmailSignupScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function EmailSignupScreen({
  navigation,
}: EmailSignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleLongPress = () => setPasswordVisible(prevState => !prevState);

  const {signupWithEmail} = useAuth();

  // const togglePeek = () => setPeekPass(!peekPass);

  const handleEmailLogin = () => {
    if (password !== confirmPassword) {
      Alert.alert('Password does not match!');
      return;
    }
    if (
      email.length === 0 &&
      password.length === 0 &&
      confirmPassword.length === 0
    ) {
      Alert.alert('Form needs to be filled out!');
      return;
    }

    setLoading(true);
    try {
      signupWithEmail(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View>Loading...</View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{gap: 10}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Employee sign-up</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={text => setEmail(text)}
              style={styles.textInput}
              placeholder="Email"
              // type="email"
            />
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              autoCorrect={false}
              autoCapitalize="none"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={text => setPassword(text)}
              // type="password"
              style={styles.textInput}
              placeholder="Enter Password"
            />
            <Pressable
              onLongPress={handleLongPress}
              onPressOut={() => setPasswordVisible(false)}>
              <Image
                source={require('../../assets/eye.png')}
                style={styles.eyeIcon}
                resizeMode="contain"
                accessibilityLabel="eye icon"
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              autoCorrect={false}
              autoCapitalize="none"
              secureTextEntry={!isPasswordVisible}
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              // type="password"
              style={styles.textInput}
              placeholder="Confirm Password"
            />
            <Pressable
              onLongPress={handleLongPress}
              onPressOut={() => setPasswordVisible(false)}>
              <Image
                source={require('../../assets/eye.png')}
                style={styles.eyeIcon}
                resizeMode="contain"
                accessibilityLabel="eye icon"
              />
            </Pressable>
          </View>
        </View>
        <ButtonTemplate
          title="Signup"
          stylebtn="purple"
          action={handleEmailLogin}
        />
        <View
          style={{
            flexDirection: 'row',
            marginTop: '5%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#000000',
              fontFamily: 'Montserrat',
              fontWeight: '400',
              fontSize: 14,
              lineHeight: 21,
            }}>
            Already have an account?
          </Text>
          <Text
            style={{
              color: '#5271FF',
              fontFamily: 'Montserrat',
              fontWeight: '400',
              fontSize: 14,
              lineHeight: 21,
            }}
            onPress={() => navigation.navigate('EmailLogin')}>
            {' '}
            Sign In
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: screenHeight * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    width: screenWidth * 0.8,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101012',
    fontFamily: 'Montserrat',
  },
  formContainer: {
    gap: 2,
    width: screenWidth * 0.8,
    marginVertical: 2,
  },
  label: {
    textAlign: 'left',
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    alignSelf: 'flex-start',
    color: '#5A5A5D',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: screenHeight * 0.05,
  },
  textInput: {
    height: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 15,
    paddingRight: 45,
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 14,
  },
  eyeIcon: {
    position: 'absolute',
    width: 30,
    height: 30,
    right: 10,
    top: 5,
    transform: [{translateY: -15}],
  },
});
