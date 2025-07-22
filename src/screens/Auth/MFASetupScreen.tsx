import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSecurityContext} from '../../context/SecurityContext';
import {ButtonTemplate} from '../../components';
import {MFASetupScreenProps} from '../../constants';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MFASetupScreen = ({navigation, route}: MFASetupScreenProps) => {
  const {state, actions} = useSecurityContext();
  const [currentStep, setCurrentStep] = useState<'info' | 'setup' | 'verify' | 'backup'>('info');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTime] = useState(route?.params?.isFirstTime || false);

  useEffect(() => {
    if (state.isMFAEnabled && !isFirstTime) {
      setCurrentStep('backup');
      generateBackupCodes();
    }
  }, [state.isMFAEnabled, isFirstTime]);

  const generateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await actions.generateBackupCodes();
      setBackupCodes(codes);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate backup codes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would send SMS
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to ${phoneNumber}. Please enter it below.`,
        [{text: 'OK'}]
      );
      
      setCurrentStep('verify');
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await actions.verifyMFACode(verificationCode);
      
      if (isValid) {
        const success = await actions.enableMFA();
        if (success) {
          actions.logSecurityEvent({
            type: 'mfa_setup',
            details: {enabled: true, method: 'sms'},
          });
          
          Alert.alert(
            'MFA Enabled Successfully',
            'Multi-factor authentication has been enabled for your account.',
            [{text: 'Continue', onPress: () => setCurrentStep('backup')}]
          );
          
          await generateBackupCodes();
        } else {
          Alert.alert('Error', 'Failed to enable MFA. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    if (isFirstTime) {
      navigation.replace('Dashboard');
    } else {
      navigation.goBack();
    }
  };

  const renderInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enable Multi-Factor Authentication</Text>
      <Text style={styles.description}>
        Multi-factor authentication adds an extra layer of security to your account by requiring
        a verification code from your phone in addition to your password.
      </Text>
      
      <View style={styles.benefitsList}>
        <Text style={styles.benefitItem}>• Enhanced account security</Text>
        <Text style={styles.benefitItem}>• Protection against unauthorized access</Text>
        <Text style={styles.benefitItem}>• HIPAA compliance requirement</Text>
        <Text style={styles.benefitItem}>• Peace of mind for sensitive health data</Text>
      </View>

      <ButtonTemplate
        title="Set Up MFA"
        stylebtn="purple"
        action={() => setCurrentStep('setup')}
      />
      
      {!isFirstTime && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSetupStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <Text style={styles.description}>
        We'll send a verification code to this number for multi-factor authentication.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      <ButtonTemplate
        title={isLoading ? "Sending..." : "Send Verification Code"}
        stylebtn="purple"
        action={handleSendVerification}
        disabled={isLoading}
      />

      <TouchableOpacity onPress={() => setCurrentStep('info')} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.description}>
        Please enter the 6-digit verification code sent to {phoneNumber}.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Verification Code</Text>
        <TextInput
          style={styles.textInput}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="123456"
          keyboardType="numeric"
          maxLength={6}
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      <ButtonTemplate
        title={isLoading ? "Verifying..." : "Verify Code"}
        stylebtn="purple"
        action={handleVerifyCode}
        disabled={isLoading}
      />

      <TouchableOpacity onPress={() => setCurrentStep('setup')} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackupCodesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Backup Codes</Text>
      <Text style={styles.description}>
        Save these backup codes in a secure location. You can use them to access your account
        if you don't have access to your phone.
      </Text>

      <View style={styles.backupCodesContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#5271FF" />
        ) : (
          backupCodes.map((code, index) => (
            <View key={index} style={styles.backupCodeItem}>
              <Text style={styles.backupCodeText}>{code}</Text>
            </View>
          ))
        )}
      </View>

      <Text style={styles.warningText}>
        ⚠️ Store these codes securely. Each code can only be used once.
      </Text>

      <ButtonTemplate
        title="I've Saved My Backup Codes"
        stylebtn="purple"
        action={handleComplete}
      />

      <TouchableOpacity onPress={generateBackupCodes} style={styles.regenerateButton}>
        <Text style={styles.regenerateText}>Generate New Codes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {currentStep === 'info' && renderInfoStep()}
        {currentStep === 'setup' && renderSetupStep()}
        {currentStep === 'verify' && renderVerifyStep()}
        {currentStep === 'backup' && renderBackupCodesStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  benefitItem: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 10,
    paddingLeft: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  backupCodesContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    minHeight: 200,
    justifyContent: 'center',
  },
  backupCodeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  backupCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: '#5271FF',
    textAlign: 'center',
  },
  regenerateButton: {
    marginTop: 10,
    padding: 10,
  },
  regenerateText: {
    fontSize: 16,
    color: '#5271FF',
    textAlign: 'center',
  },
});

export default MFASetupScreen;