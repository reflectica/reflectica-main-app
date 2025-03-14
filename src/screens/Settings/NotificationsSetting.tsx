import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Switch, Dimensions, Alert } from 'react-native';
import PushNotificationIOS, { PushNotificationPermissions } from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const NotificationsSettings: React.FC = (): React.ReactElement => {
  const [isGeneralEnabled, setIsGeneralEnabled] = useState<boolean>(false);
  const [isDailyRemindersEnabled, setIsDailyRemindersEnabled] = useState<boolean>(false);
  const [isSessionPingsEnabled, setIsSessionPingsEnabled] = useState<boolean>(false);
  const [isClinicalAlertsEnabled, setIsClinicalAlertsEnabled] = useState<boolean>(false);
  const [isMessagesEnabled, setIsMessagesEnabled] = useState<boolean>(false);

  // Load saved notification settings on component mount
  useEffect(() => {
    loadNotificationSettings();
    
    // Request notification permissions
    PushNotificationIOS.requestPermissions({
      alert: true,
      badge: true,
      sound: true
    }).then((permissions: PushNotificationPermissions) => {
      if (!permissions.alert) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive updates.',
          [{ text: 'OK' }]
        );
      }
    });
  }, []);

  // Save notification settings to AsyncStorage
  const saveNotificationSettings = async () => {
    try {
      const settings = {
        isGeneralEnabled,
        isDailyRemindersEnabled,
        isSessionPingsEnabled,
        isClinicalAlertsEnabled,
        isMessagesEnabled
      };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Load notification settings from AsyncStorage
  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsGeneralEnabled(settings.isGeneralEnabled);
        setIsDailyRemindersEnabled(settings.isDailyRemindersEnabled);
        setIsSessionPingsEnabled(settings.isSessionPingsEnabled);
        setIsClinicalAlertsEnabled(settings.isClinicalAlertsEnabled);
        setIsMessagesEnabled(settings.isMessagesEnabled);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Schedule a daily reminder notification
  const scheduleDailyReminder = () => {
    const date = new Date();
    date.setHours(9, 0, 0, 0); // Set notification for 9:00 AM
    
    // If it's already past 9:00 AM, schedule for tomorrow
    if (date < new Date()) {
      date.setDate(date.getDate() + 1);
    }
    
    PushNotificationIOS.addNotificationRequest({
      id: 'daily-reminder',
      title: 'Daily Reflection',
      body: 'Time to complete your daily reflection!',
      fireDate: date,
      repeats: true,
      repeatsComponent: {
        day: true, // Repeat daily
      }
    });
    
    console.log('Daily reminder scheduled for:', date.toISOString());
  };

  // Cancel scheduled notifications
  const cancelNotifications = (type?: string) => {
    if (type) {
      PushNotificationIOS.removePendingNotificationRequests([type]);
    } else {
      PushNotificationIOS.removeAllPendingNotificationRequests();
    }
  };

  // Toggle general notifications
  const toggleGeneral = () => {
    const newValue = !isGeneralEnabled;
    setIsGeneralEnabled(newValue);
    
    if (!newValue) {
      // If general is turned off, cancel all notifications
      cancelNotifications();
    } else if (isDailyRemindersEnabled) {
      // If general is turned on and daily reminders are enabled, schedule them
      scheduleDailyReminder();
    }
    
    // Save settings after a slight delay to ensure state is updated
    setTimeout(() => saveNotificationSettings(), 100);
  };

  // Toggle daily reminders
  const toggleDailyReminders = () => {
    const newValue = !isDailyRemindersEnabled;
    setIsDailyRemindersEnabled(newValue);
    
    if (isGeneralEnabled) {
      if (newValue) {
        scheduleDailyReminder();
      } else {
        cancelNotifications('daily-reminder');
      }
    }
    
    setTimeout(() => saveNotificationSettings(), 100);
  };

  // Toggle session pings
  const toggleSessionPings = () => {
    const newValue = !isSessionPingsEnabled;
    setIsSessionPingsEnabled(newValue);
    
    // Implementation for session pings would go here
    
    setTimeout(() => saveNotificationSettings(), 100);
  };

  // Toggle clinical alerts
  const toggleClinicalAlerts = () => {
    const newValue = !isClinicalAlertsEnabled;
    setIsClinicalAlertsEnabled(newValue);
    
    // Implementation for clinical alerts would go here
    
    setTimeout(() => saveNotificationSettings(), 100);
  };

  // Toggle messages
  const toggleMessages = () => {
    const newValue = !isMessagesEnabled;
    setIsMessagesEnabled(newValue);
    
    // Implementation for message notifications would go here
    
    setTimeout(() => saveNotificationSettings(), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>General</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isGeneralEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleGeneral}
          value={isGeneralEnabled}
        />
      </View>
      <View style={[styles.settingContainer, !isGeneralEnabled && styles.disabledSetting]}>
        <Text style={styles.settingText}>Daily Reminders</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDailyRemindersEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleDailyReminders}
          value={isDailyRemindersEnabled}
          disabled={!isGeneralEnabled}
        />
      </View>
      <View style={[styles.settingContainer, !isGeneralEnabled && styles.disabledSetting]}>
        <Text style={styles.settingText}>Session Pings</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isSessionPingsEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSessionPings}
          value={isSessionPingsEnabled}
          disabled={!isGeneralEnabled}
        />
      </View>
      <View style={[styles.settingContainer, !isGeneralEnabled && styles.disabledSetting]}>
        <Text style={styles.settingText}>Clinical Alerts</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isClinicalAlertsEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleClinicalAlerts}
          value={isClinicalAlertsEnabled}
          disabled={!isGeneralEnabled}
        />
      </View>
      <View style={[styles.settingContainer, !isGeneralEnabled && styles.disabledSetting]}>
        <Text style={styles.settingText}>Messages</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isMessagesEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleMessages}
          value={isMessagesEnabled}
          disabled={!isGeneralEnabled}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  disabledSetting: {
    opacity: 0.5,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NotificationsSettings;