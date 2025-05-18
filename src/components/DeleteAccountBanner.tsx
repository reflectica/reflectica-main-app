import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { deleteUser } from 'firebase/auth';

const screenWidth = Dimensions.get('window').width;

interface DeleteAccountBannerProps {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

const DeleteAccountBanner: React.FC<DeleteAccountBannerProps> = ({ visible, onCancel, onDelete }) => {
  if (!visible) return null;

  return (
    <View style={styles.bannerContainer}>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.message}>Are you sure you want to delete account?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
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
    color: '#FF5252',
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
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 27,
    textAlign: 'center',
    color: '#5271FF',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    width: 152.49,
    height: 41.62,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 27,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});

export default DeleteAccountBanner;