import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SettingScreenProps} from '../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function SettingScreen({navigation}: SettingScreenProps) {
  const options = [
    {
      icon: require('../assets/settings/profile.png'),
      title: 'Profile information',
      action: '',
    },
    {
      icon: require('../assets/settings/password.png'),
      title: 'Password & Security',
      action: '',
    },
    {
      icon: require('../assets/settings/billing.png'),
      title: 'Billing information',
      action: '',
    },
    {
      icon: require('../assets/settings/notification.png'),
      title: 'Notifications',
      action: '',
      // navigation.navigate(''),
    },
    {
      icon: require('../assets/settings/privacy.png'),
      title: 'Privacy Management',
      action: '',
    },
    {
      icon: require('../assets/settings/provider.png'),
      title: 'Provider integration',
      action: '',
    },
    {
      icon: require('../assets/settings/account.png'),
      title: 'Account Deletion',
      action: '',
    },
    {
      icon: require('../assets/settings/logout.png'),
      title: 'Logout from Account',
      action: '',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {options.map((option, index) => (
        <TouchableOpacity key={index} style={styles.btnContainer}>
          <Image source={option.icon} style={styles.icon} />
          <Text style={styles.btnText}>{option.title}</Text>
        </TouchableOpacity>
      ))}

      {/* <MenuBar /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    gap: 20,
  },
  title: {
    fontWeight: '700',
    fontSize: 25,
    alignSelf: 'center',
  },
  btnContainer: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.07,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  icon: {
    width: screenWidth * 0.05,
    height: screenWidth * 0.05,
    marginRight: 10,
  },
  btnText: {
    fontFamily: 'Mukta',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
  },
});
