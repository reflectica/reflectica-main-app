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
  Alert,
} from 'react-native';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {ButtonTemplate} from '../../components';
import {useAuth} from '../../context/AuthContext';
import {useSecurityContext} from '../../context/SecurityContext';
import {LoginScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function LoginScreen({navigation}: LoginScreenProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState();
  const {currentUser, isLoggedIn} = useAuth();
  const {state: securityState, actions: securityActions} = useSecurityContext();

  // Check for security compliance on mount
  useEffect(() => {
    checkSecurityCompliance();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      // Check if MFA or security questions are required
      if (!securityState.isMFAEnabled) {
        navigation.navigate('MFASetup', {isFirstTime: true});
      } else if (!securityState.hasSecurityQuestions) {
        navigation.navigate('SecurityQuestion', {mode: 'setup'});
      } else {
        navigation.navigate('Dashboard');
      }
    }
  }, [isLoggedIn, currentUser, securityState.isMFAEnabled, securityState.hasSecurityQuestions, navigation]);

  const checkSecurityCompliance = async () => {
    try {
      const report = await securityActions.checkSecurityCompliance();
      if (!report.isCompliant && report.issues.length > 0) {
        securityActions.addSecurityAlert({
          type: 'warning',
          title: 'Security Setup Required',
          message: 'Please complete security setup for HIPAA compliance.',
        });
      }
    } catch (error) {
      console.error('Error checking security compliance:', error);
    }
  };

  // Show security alerts if any
  useEffect(() => {
    if (securityState.securityAlerts.length > 0) {
      const unDismissedAlerts = securityState.securityAlerts.filter(alert => !alert.dismissed);
      if (unDismissedAlerts.length > 0) {
        const alert = unDismissedAlerts[0];
        Alert.alert(
          alert.title,
          alert.message,
          [
            {
              text: 'OK',
              onPress: () => securityActions.dismissSecurityAlert(alert.id),
            },
          ]
        );
      }
    }
  }, [securityState.securityAlerts, securityActions]);

  // Show account lockout status
  useEffect(() => {
    if (securityState.isAccountLocked && securityState.lockoutTimeRemaining > 0) {
      const minutes = Math.ceil(securityState.lockoutTimeRemaining / 60000);
      Alert.alert(
        'Account Locked',
        `Your account is temporarily locked due to too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
        [{text: 'OK'}]
      );
    }
  }, [securityState.isAccountLocked, securityState.lockoutTimeRemaining]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    try {
      // Google sign-in is commented out in AuthProvider
      Alert.alert('Feature Unavailable', 'Google Sign-In is currently unavailable. Please use email login.');
    } catch (error) {
      console.error('Sign-up failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseLogin = () => {
    if (securityState.isAccountLocked) {
      const minutes = Math.ceil(securityState.lockoutTimeRemaining / 60000);
      Alert.alert(
        'Account Locked',
        `Your account is temporarily locked. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
      );
      return;
    }
    navigation.navigate('EmailSignup');
  };

  const handlePhoneLogin = () => {
    if (securityState.isAccountLocked) {
      const minutes = Math.ceil(securityState.lockoutTimeRemaining / 60000);
      Alert.alert(
        'Account Locked',
        `Your account is temporarily locked. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
      );
      return;
    }
    navigation.navigate('PhoneNumber');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        resizeMode="contain"
        style={styles.reflecticaLogo}
        source={require('../../assets/icons/logoTransparent.png')}
        accessibilityLabel="Reflectica Logo"
      />
      <Text style={styles.signInText}>
        Sign in to continue!
      </Text>
      
      {/* Security Status Indicator */}
      {securityState.loginAttempts > 0 && !securityState.isAccountLocked && (
        <View style={styles.securityWarning}>
          <Text style={styles.securityWarningText}>
            ⚠️ {securityState.loginAttempts} failed attempt{securityState.loginAttempts !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      {securityState.isAccountLocked && (
        <View style={styles.securityError}>
          <Text style={styles.securityErrorText}>
            🔒 Account temporarily locked
          </Text>
        </View>
      )}

      <ButtonTemplate
        title="Use enterprise login"
        stylebtn="purple"
        action={handleEnterpriseLogin}
        disabled={loading || securityState.isAccountLocked}
      />
      <ButtonTemplate
        title="Use phone number"
        stylebtn="clear"
        action={handlePhoneLogin}
        disabled={loading || securityState.isAccountLocked}
      />

      {/* Security Information */}
      <View style={styles.securityInfo}>
        <Text style={styles.securityInfoText}>
          🔐 HIPAA Compliant Authentication
        </Text>
        <Text style={styles.securityInfoSubtext}>
          Your health data is protected with enterprise-grade security
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5271FF" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  reflecticaLogo: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.4,
    position: 'relative',
    marginBottom: -50,
  },
  signInText: {
    position: 'relative',
    fontFamily: 'Montserrat',
    lineHeight: 27,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 30,
  },
  securityWarning: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  securityWarningText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  securityError: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  securityErrorText: {
    color: '#721C24',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  securityInfo: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    width: '100%',
  },
  securityInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 5,
  },
  securityInfoSubtext: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
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
});
