import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';
// import { app, auth } from '../firebase/firebaseConfig'
// import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser } from "../features/auth/authSlices";
import ButtonTemplate from '../../components/ButtonTemplate';
import {useAuth} from '../../context/AuthContext';
import {SignupScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Signup({navigation}: SignupScreenProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState();
  const {signInWithGoogle} = useAuth();

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      signInWithGoogle();
    } catch (error) {
      console.error('Sign-up failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // const [isLogged, setIsLogged] = useState(false);
  // // const [customer, setCustomer] = useState(null)

  // const dispatch = useDispatch();
  // const customer = useSelector((state) => state.customer.customerProfile);

  // const handleLogin = () => {
  //   dispatch(loginUser());
  //   setIsLogged(true);
  // };

  // const handleLogout = () => {
  //   dispatch(logoutUser());
  //   setIsLogged(false);
  // };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        resizeMode="contain"
        style={styles.reflecticaLogo}
        source={require('../../assets/icons/logoTransparent.png')}
        accessibilityLabel="Reflectica Logo"
      />
      <Text
        style={{
          position: 'relative',
          fontFamily: 'Montserrat',
          lineHeight: 27,
          fontSize: 18,
          fontWeight: '700',
          color: '#000000',
        }}>
        Sign up to continue!
      </Text>
      <ButtonTemplate
        title="Use enterprise license"
        stylebtn="purple"
        action={() => navigation.navigate('PhoneNumber')}
      />
      <ButtonTemplate
        title="Purchase for personal use"
        stylebtn="clear"
        action={() => navigation.navigate('EmailSignup')}
      />

      {/* <View style={styles.signupOptionsContainer}> */}
      {/* <Text style={ {marginTop:100 }}>Or signup with</Text>
        <View style={styles.logoContainer}>
          <TouchableOpacity style={styles.logoBoxes} onPress={handleGoogleSignUp}>
            <Image 
              source={require('../../assets/icons/Google-Logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Google Logo"
            />
          </TouchableOpacity>

          <View style={styles.logoBoxes}>
            <Image 
              source={require('../../assets/icons/Apple-Logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Apple Logo"
            />
          </View>
        </View> */}

      <View style={styles.logoContainer}>
        <Text style={styles.textOptions}>Terms of use</Text>
        <Text style={styles.textOptions}>Privacy Policy</Text>
      </View>
      {/* </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  reflecticaLogo: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.4,
    position: 'relative',
    marginBottom: -50,
  },
  // signupOptionsContainer: {
  //   alignItems:'center',
  //   marginBottom: 100
  // },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth * 0.6,
    marginTop: screenHeight * 0.3,
  },
  textOptions: {
    color: '#5271FF',
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  logoBoxes: {
    borderWidth: 1,
    borderColor: '#EDEDED',
    padding: '5%',
    borderRadius: 10,
  },
  // logo: {
  //   width: 50,
  //   height:50,
  // }
});
