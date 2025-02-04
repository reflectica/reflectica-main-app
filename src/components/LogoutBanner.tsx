import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface LogoutBannerProps {
  visible: boolean;
  onCancel: () => void;
  onLogout: () => void;
}

const LogoutBanner: React.FC<LogoutBannerProps> = ({ visible, onCancel, onLogout }) => {
  if (!visible) return null;

  return (
    <View style={styles.bannerContainer}>
      <Text style={styles.title}>Logout</Text>
      <Text style={styles.message}>Are you sure you want to log out?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Yes, Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth * 0.9,
    height: 206.04,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontFamily: 'Mukta',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 33,
    textAlign: 'center',
    color: '#5271FF',
    marginBottom: 10,
  },
  message: {
    fontFamily: 'Mukta',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 27,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'rgba(82, 113, 255, 0.05)',
    width: 149.36,
    height: 41.62,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
    color: '#5271FF',
  },
  logoutButton: {
    backgroundColor: '#5271FF',
    width: 152.49,
    height: 41.62,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});

export default LogoutBanner;