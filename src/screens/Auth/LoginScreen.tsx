import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser } from "../features/auth/authSlices";
import {ButtonTemplate} from '../../components';
// import { useNavigation } from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {LoginScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function LoginScreen({navigation}: LoginScreenProps) {
  // const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState();
  const {signInWithGoogle} = useAuth();

  const handleGoogleSignIn = () => {
    setLoading(true);
    try {
      signInWithGoogle();
    } catch (error) {
      console.error('Sign-up failed:', error);
    } finally {
      setLoading(false);
    }
  };

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
        Sign in to continue!
      </Text>
      <ButtonTemplate
        title="Use enterprise login"
        stylebtn="purple"
        action={() => navigation.navigate('EmailSignup')}
      />
      <ButtonTemplate
        title="Use phone number"
        stylebtn="clear"
        action={() => navigation.navigate('PhoneNumber')}
      />

      {/* COMMENTED OUT GOOGLE AND APPLE AUTH */}
      {/* <View style={styles.signupOptionsContainer}>
        <Text style={ {marginTop:100 }}>Or sign in with</Text>

        <View style={styles.logoContainer}>
          <TouchableOpacity 
            style={styles.logoBoxes}
            onPress={handleGoogleSignIn}
          >
            <Image 
              source={require('../../assets/icons/Google-Logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Google Logo"
            />
          </TouchableOpacity> */}

      {/* <View style={styles.logoBoxes}>
            <Image 
              source={require('../../assets/icons/Apple-Logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Apple Logo"
            />
          </View> */}
      {/* </View>
      </View>  */}
    </SafeAreaView>

    // <View style={styles.container}>
    //   {isLogged ?
    //     <View>
    //       <Button
    //       title="Logout"
    //       onPress={handleLogout}
    //       />
    //     </View>
    //     :
    //     <Button
    //     onPress={handleLogin}
    //     title="Login"
    //     />
    //   }
    // </View>
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
  //   paddingTop:'5%',
  //   alignItems:'center',
  //   marginBottom:100
  // },
  logoContainer: {
    // display:'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth * 0.6,
    marginTop: screenHeight * 0.3,
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
