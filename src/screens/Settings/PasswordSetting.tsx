import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';

const PasswordSetting: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New password and confirm new password do not match.');
      return;
    }

    if (currentUser && currentPassword) {
      const credential = auth.EmailAuthProvider.credential(currentUser.email!, currentPassword);

      try {
        await currentUser.reauthenticateWithCredential(credential);
        await currentUser.updatePassword(newPassword);
        Alert.alert('Success', 'Password updated successfully.');
      } catch (error) {
        Alert.alert('Error', 'Current password is incorrect or there was an issue updating the password.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Password & Security</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    width: '80%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(82, 113, 255, 0.08)', // Light bluish-greyish color with low opacity
  },
  button: {
    backgroundColor: '#5271FF',
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
    width: '55%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: '700',
    fontSize: 25,
    alignSelf: 'center',
    paddingBottom: 40,
  },
});

export default PasswordSetting;