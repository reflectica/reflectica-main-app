import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Image, Modal, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const UpdateProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [currentUser]);

  const handleEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
    setModalVisible(true);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1(${match[1]})-${match[2]}-${match[3]}`;
    }
    return null;
  };

  const handleSave = async () => {
    if (currentUser) {
      if (editField === 'email' && !validateEmail(editValue)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }

      let valueToSave = editValue;

      if (editField === 'phoneNumber') {
        const formattedPhoneNumber = formatPhoneNumber(editValue);
        if (!formattedPhoneNumber) {
          Alert.alert('Invalid Phone Number', 'Please enter a valid phone number or remove symbols.');
          return;
        }
        valueToSave = formattedPhoneNumber;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedData = { [editField]: valueToSave };

      await updateDoc(userDocRef, updatedData);
      setUserInfo({ ...userInfo, ...updatedData });
      setModalVisible(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#5271FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile Information</Text>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: userInfo?.profilePic || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIconContainer} onPress={() => handleEdit('profilePic', userInfo?.profilePic || '')}>
          <Image source={require('../../assets/Group13.png')} style={styles.editIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Full Name:</Text>
        <View style={styles.infoContainer}>
          <View style={styles.rectangleView}>
            <Text style={styles.value}>{userInfo?.name || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEdit('name', userInfo?.name || '')}>
            <Image source={require('../../assets/Group13.png')} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Birthday:</Text>
        <View style={styles.infoContainer}>
          <View style={styles.rectangleView}>
            <Text style={styles.value}>{userInfo?.birthday || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEdit('birthday', userInfo?.birthday || '')}>
            <Image source={require('../../assets/Group13.png')} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Email:</Text>
        <View style={styles.infoContainer}>
          <View style={styles.rectangleView}>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{currentUser?.email || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEdit('email', currentUser?.email || '')}>
            <Image source={require('../../assets/Group13.png')} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Phone Number:</Text>
        <View style={styles.infoContainer}>
          <View style={styles.rectangleView}>
            <Text style={styles.value}>{userInfo?.phoneNumber || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEdit('phoneNumber', userInfo?.phoneNumber || '')}>
            <Image source={require('../../assets/Group13.png')} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
            />
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
    fontWeight: '700',
    fontSize: 25,
    alignSelf: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  editIcon: {
    width: 24, // Reduced size
    height: 24, // Reduced size
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    alignSelf: 'center',
    width: '70%',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Added to position the edit button
  },
  rectangleView: {
    borderRadius: 15,
    backgroundColor: "#fff",
    width: '70%',
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  editButton: {
    position: 'absolute', // Position absolute to overlap
    right: 75, // Adjust to overlap the right side of the text bar
    top: 12, // Adjust to vertically center the icon
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});

export default UpdateProfile;