import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Switch, Dimensions } from 'react-native';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const NotificationsSettings: React.FC = () => {
  const [isGeneralEnabled, setIsGeneralEnabled] = useState<boolean>(false);
  const [isDailyRemindersEnabled, setIsDailyRemindersEnabled] = useState<boolean>(false);
  const [isSessionPingsEnabled, setIsSessionPingsEnabled] = useState<boolean>(false);
  const [isClinicalAlertsEnabled, setIsClinicalAlertsEnabled] = useState<boolean>(false);
  const [isMessagesEnabled, setIsMessagesEnabled] = useState<boolean>(false);

  const toggleGeneral = () => setIsGeneralEnabled(previousState => !previousState);
  const toggleDailyReminders = () => setIsDailyRemindersEnabled(previousState => !previousState);
  const toggleSessionPings = () => setIsSessionPingsEnabled(previousState => !previousState);
  const toggleClinicalAlerts = () => setIsClinicalAlertsEnabled(previousState => !previousState);
  const toggleMessages = () => setIsMessagesEnabled(previousState => !previousState);

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
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Daily Reminders</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDailyRemindersEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleDailyReminders}
          value={isDailyRemindersEnabled}
        />
      </View>
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Session Pings</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isSessionPingsEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSessionPings}
          value={isSessionPingsEnabled}
        />
      </View>
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Clinical Alerts</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isClinicalAlertsEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleClinicalAlerts}
          value={isClinicalAlertsEnabled}
        />
      </View>
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Messages</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isMessagesEnabled ? '#5271FF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleMessages}
          value={isMessagesEnabled}
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
  settingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 18,
    color: '#333',
  },
  title: {
    fontWeight: '700',
    fontSize: 25,
    alignSelf: 'center',
  },
});

export default NotificationsSettings;