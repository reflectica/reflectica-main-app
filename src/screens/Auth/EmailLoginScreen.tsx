/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  TextInput,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import {ButtonTemplate} from '../../components';
import {useAuth} from '../../context/AuthContext';
import {EmailLoginScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function EmailLoginScreen({navigation}: EmailLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const {loginWithEmail} = useAuth();

  const handleLongPress = () => setPasswordVisible(prevState => !prevState);

  const handleEmailLogin = () => {
    setLoading(true);
    try {
      loginWithEmail(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{gap: 25}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <View style={styles.titleContainer}>
          <Text
            style={{
              color: '#101012',
              fontSize: 28,
              lineHeight: 28,
              fontFamily: 'Montserrat',
              fontWeight: '600',
              alignSelf: 'flex-start',
            }}>
            Employee login
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={text => setEmail(text)}
              style={styles.textInput}
              placeholder="Email"
              // type="email"
              autoCapitalize="none"
              keyboardType="email-address"
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
              placeholder="Enter your Password"
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
          title="Login"
          stylebtn="purple"
          action={handleEmailLogin}
        />
        <View
          style={{flexDirection: 'row', marginTop: '5%', alignSelf: 'center'}}>
          <Text style={[styles.actionStyle, {color: '#000000'}]}>
            Don't have an account?
          </Text>
          <Text
            style={[styles.actionStyle, {color: '#5271FF'}]}
            onPress={() => navigation.navigate('Signup')}>
            {' '}
            Sign up
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
  formContainer: {
    gap: 2,
    height: 50,
    width: screenWidth * 0.8,
    marginVertical: 2,
  },
  label: {
    textAlign: 'left',
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: screenHeight * 0.05,
  },
  textInput: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 15,
    // color: 'black',
    height: 50,
    paddingRight: 45,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#BEBEBF',
  },
  eyeIcon: {
    position: 'absolute',
    width: 30,
    height: 30,
    right: 10,
    top: 5,
    transform: [{translateY: -15}],
  },
  actionStyle: {
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
});
