import React, { useState } from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import {SettingScreenProps} from '../constants';
import {useAuth} from '../context/AuthContext';
import LogoutBanner from '../components/LogoutBanner';
import DeleteAccountBanner from '../components/DeleteAccountBanner';
import { deleteUser } from '@react-native-firebase/auth';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function SettingScreen({ navigation }: SettingScreenProps) {
  const { currentUser, handleLogout } = useAuth();
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);
  const [isLogoutBannerVisible, setIsLogoutBannerVisible] = useState<boolean>(false);

  const handleDeleteAccount = async () => {
    if (currentUser) {
      try {
        await deleteUser(currentUser);
        Alert.alert('Success', 'Account deleted successfully.');
        handleLogout();
      } catch (error) {
        Alert.alert('Error', 'There was an issue deleting the account.');
      }
    }
  };

  const options = [
    {
      icon: require('../assets/settings/profile.png'),
      title: 'Profile information',
      action: () => navigation.navigate('ProfileSetting'),
    },
    {
      icon: require('../assets/settings/password.png'),
      title: 'Password & Security',
      action: () => navigation.navigate('PasswordSetting'),
    },
    {
      icon: require('../assets/settings/notification.png'),
      title: 'Notifications',
      action: () => navigation.navigate('NotificationsSetting'),
    },
    {
      icon: require('../assets/settings/privacy.png'),
      title: 'Privacy Management',
      action: () => {},
    },
    {
      icon: require('../assets/settings/account.png'),
      title: 'Account Deletion',
      action: () => setIsBannerVisible(true),
    },
    {
      icon: require('../assets/settings/logout.png'),
      title: 'Logout from Account',
      action: () => setIsLogoutBannerVisible(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {options.map((option, index) => (
        <TouchableOpacity key={index} style={styles.btnContainer} onPress={option?.action}>
          <Image source={option.icon} style={styles.icon} />
          <Text style={styles.btnText}>{option.title}</Text>
        </TouchableOpacity>
      ))}
      <DeleteAccountBanner
        visible={isBannerVisible}
        onCancel={() => setIsBannerVisible(false)}
        onDelete={handleDeleteAccount}
      />
      <LogoutBanner
        visible={isLogoutBannerVisible}
        onCancel={() => setIsLogoutBannerVisible(false)}
        onLogout={handleLogout}
      />      
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






