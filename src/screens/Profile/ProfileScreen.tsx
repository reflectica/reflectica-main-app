/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import {ButtonTemplate} from '../../components/index';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {useSelector} from 'react-redux';
import {selectUser} from '../../features/auth/authSelectors.ts'; // import the selector
import {db} from '../../firebase/firebaseConfig.ts';
import {collection, getDocs, setDoc, where, query} from 'firebase/firestore';
import {ProfileScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const calendarTheme = {
  textDayFontFamily: 'Montserrat',
  textMonthFontFamily: 'Montserrat',
  textDayHeaderFontFamily: 'Montserrat',
  textDayFontSize: 14,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 14,
  lineHeight: 17.07,
};

export default function ProfileScreen({navigation}: ProfileScreenProps) {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');
  const user = useSelector(selectUser);

  useEffect(() => {
    console.log('Current User:', user);
  }, [user]);

  const addUserInfo = async () => {
    const userRef = collection(db, 'users');
    const querying = query(userRef, where('uid', '==', user?.uid));

    if (!firstName && !lastName) {
      try {
        const userQuerySnap = await getDocs(querying);
        if (userQuerySnap && !userQuerySnap.empty) {
          const userDoc = userQuerySnap.docs[0];

          await setDoc(
            userDoc.ref,
            {
              firstName: firstName || userDoc.data().firstName,
              lastName: lastName || userDoc.data().lastName,
              birthday: selected || userDoc.data().birthday,
            },
            {merge: true},
          );

          console.log('User information updated successfully.');
        } else {
          console.log('User information updated unsuccessfully');
        }
      } catch (error) {
        console.error('Error updating user information:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{alignSelf: 'flex-end', marginRight: 20}}>
        <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontWeight: '700',
              fontSize: 16,
              lineHeight: 24,
              color: 'rgba(82, 113, 255, 1)',
            }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          fontFamily: 'Montserrat',
          fontWeight: '700',
          fontSize: 34,
          lineHeight: 51,
          color: 'rgba(0, 0, 0, 1)',
        }}>
        Profile details
      </Text>
      <View style={styles.profileImageContainer}>
        <Image
          source={require('../../assets/profile/Profile.png')}
          resizeMode="contain"
          style={styles.profileImagePlaceHolder}
        />
        <TouchableOpacity>
          <Image
            source={require('../../assets/profile/camera.png')}
            resizeMode="contain"
            style={styles.cameraImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={firstName}
          style={styles.textInput}
          placeholder="First name"
        />
        <TextInput
          value={lastName}
          style={styles.textInput}
          placeholder="Last name"
        />
      </View>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={styles.birthdaybox}>
        <Image
          source={require('../../assets/profile/Calendar.png')}
          resizeMode="contain"
          style={styles.calendarIcon}
        />
        <Text style={{fontSize: 14, fontWeight: 'bold', color: '#5271FF'}}>
          {' '}
          {!birthday ? 'Choose birthday date' : `${formatDate(birthday)}`}
        </Text>
      </TouchableOpacity>

      {/* Confirm button doesn't have any action yet! */}
      <ButtonTemplate
        title="Confirm"
        stylebtn="purple"
        action={() => addUserInfo()}
      />

      {showModal ? (
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Calendar
                  style={{
                    width: 350,
                    gap: 20,
                  }}
                  theme={calendarTheme}
                  hideDayNames={true}
                  onDayPress={(day: any) => {
                    console.log('Selected Date:', day.dateString);
                    setSelected(day.dateString);
                  }}
                  renderHeader={(date: any) => {
                    return (
                      <View
                        style={{
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 5,
                        }}>
                        <Text
                          style={[
                            styles.customHeaderText,
                            {
                              fontSize: 14,
                              fontWeight: '400',
                              lineHeight: 21,
                              color: 'rgba(0, 0, 0, 1)',
                            },
                          ]}>
                          Birthday
                        </Text>
                        <Text
                          style={[
                            styles.customHeaderText,
                            {
                              color: '#5271FF',
                              fontWeight: '700',
                              fontSize: 34,
                              lineHeight: 41.45,
                            },
                          ]}>
                          {date.getFullYear()}
                        </Text>
                        <Text
                          style={[
                            styles.customHeaderText,
                            {
                              color: '#5271FF',
                              fontSize: 14,
                              fontWeight: '400',
                              lineHeight: 21,
                            },
                          ]}>
                          {date.toString('MMMM')}
                        </Text>
                      </View>
                    );
                  }}
                  markedDates={{
                    [selected]: {
                      selected: true,
                      disableTouchEvent: true,
                      selectedColor: '#5271FF',
                      selectedTextColor: 'white',
                    },
                  }}
                />
                <ButtonTemplate
                  title="Save"
                  stylebtn="purple"
                  action={() => {
                    setBirthday(selected);
                    setShowModal(false);
                  }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    flex: 1,
    alignItems: 'center',
  },
  profileImageContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    height: 150,
    width: 150,
  },
  profileImagePlaceHolder: {
    height: 150,
    width: 150,
  },
  cameraImage: {
    position: 'relative',
    right: -110,
    top: -35,
    height: 50,
    width: 50,
  },
  inputContainer: {
    marginTop: 15,
    gap: 4,
    width: screenWidth * 0.8,
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 15,
  },
  birthdaybox: {
    flexDirection: 'row',
    backgroundColor: '#edf1ff',
    width: '80%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    // justifyContent:'center',
    marginBottom: 100,
  },
  calendarIcon: {
    height: 25,
    width: 25,
  },
  modalContainer: {
    gap: 1,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    paddingTop: screenHeight * 0.05,
    backgroundColor: 'white',
    height: screenHeight * 0.65,
    width: screenWidth,
    borderRadius: 30,
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  customHeaderText: {
    fontFamily: 'Montserrat',
  },
});
