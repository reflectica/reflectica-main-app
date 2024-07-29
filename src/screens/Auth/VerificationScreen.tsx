/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import {formatTime} from '../../utils/formatTime.ts';
import {useDispatch, useSelector} from 'react-redux';
import {loginUser} from '../../features/auth/authSlices.ts';
import {collection, addDoc, getDocs, where, query} from 'firebase/firestore';
import {db} from '../../firebase/firebaseConfig.ts';
import {VerificationScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function VerificationScreen({
  route,
  navigation,
}: VerificationScreenProps) {
  const dispatch = useDispatch();
  const [time, setTime] = useState(300);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(''),
  );
  //   '',
  //   '',
  //   '',
  //   '',
  //   '',
  //   '',
  // ]);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const [focusedIndex, setFocusedIndex] = useState(0);

  // const confirmationResult = useSelector(
  //   state => state.auth.setConfirmationResult,
  // );
  const {fullPhoneNumber, confirmationResult} = route.params;

  useEffect(() => {
    const timer = setInterval(() => {
      if (time > 0) {
        setTime(time - 1);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [time]);

  // if (verificationCode.length === 6) {
  //   useEffect(() => {
  //     const code = verificationCode.join('');
  //     console.log('CODEEEE:', code);
  //     checkVerificationCode(code);
  //   }, [verificationCode]);
  // }
  useEffect(() => {
    if (verificationCode.join('').length === 6) {
      const code = verificationCode.join('');
      console.log('CODEEEE:', code);
      checkVerificationCode(code);
    }
  }, [verificationCode]);

  const handleVerificationCodeChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newVerificationCode = [...verificationCode];
      newVerificationCode[index] = text;
      setVerificationCode(newVerificationCode);
    }
    if (text.length === 1 && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleFocus = (index: any) => {
    setFocusedIndex(index);
  };

  const renderNumberPad = () => {
    const numbers = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      ' ',
      '0',
      'X',
    ];
    const columns = 3;
    const rows = 4;

    return (
      <View style={styles.numberPad}>
        {Array.from({length: columns}, (_, colIndex) => (
          // style={styles.numberRow} this belonged in the view under
          <View key={colIndex}>
            {Array.from({length: rows}, (_, rowIndex) => {
              const index = rowIndex * columns + colIndex;
              const number = numbers[index];

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(number)}>
                  <Text style={styles.numberButtonText}>{number}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const checkVerificationCode = async (code: string | number) => {
    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(code);
        const user = result.user;
        const uid = user.uid;

        console.log('USER:', user);
        console.log('PHONE NUMBER:', fullPhoneNumber);

        const userRef = collection(db, 'users');
        const querying = query(
          userRef,
          where('phoneNumber', '==', fullPhoneNumber),
        );
        // const query = where(userRef, 'phoneNumber', '==', fullPhoneNumber).where('phoneNumber', '==', null, { includeUndefined: true });
        console.log('QUERY:', querying);

        try {
          const userQuerySnap = await getDocs(querying);

          if (userQuerySnap && !userQuerySnap.empty) {
            const userDoc = userQuerySnap.docs[0];
            dispatch(
              loginUser({
                uid: user.uid,
              }),
            );
            console.log('User already exists in database:', userDoc.data());
            navigation.navigate('Dashboard');
          } else {
            const newUserDocRef = await addDoc(userRef, {
              uid: uid,
              phoneNumber: fullPhoneNumber,
            });
            dispatch(
              loginUser({
                uid: user.uid,
              }),
            );
            console.log('User created with ID:', newUserDocRef.id);
            navigation.navigate('Profile');
          }
        } catch (queryError) {
          console.error('Error executing firestore query:', queryError);
        }
      } else {
        console.error('Confirmation result is undefined');
      }
    } catch (error) {
      console.error('ERROR:', error);
      // Alert.alert("Error: ", error)
    }
  };

  const handleNumberPress = (number: string) => {
    if (focusedIndex >= 0 && focusedIndex < verificationCode.length) {
      const newVerificationCode = [...verificationCode];

      if (number === ' ') {
        return;
      } else if (number === 'X') {
        newVerificationCode[focusedIndex] = '';

        if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1);
          if (
            inputRefs[focusedIndex - 1] &&
            inputRefs[focusedIndex - 1].current
          ) {
            inputRefs[focusedIndex - 1]?.current?.focus();
          }
        }
      } else {
        newVerificationCode[focusedIndex] = number;
        if (focusedIndex < 5) {
          setFocusedIndex(focusedIndex + 1);

          if (
            inputRefs[focusedIndex + 1] &&
            inputRefs[focusedIndex + 1].current
          ) {
            inputRefs[focusedIndex + 1]?.current?.focus();
          }
        }
        // else {
        //   const enteredCode = newVerificationCode.join('')
        //   if (enteredCode.length === 6) checkVerificationCode(enteredCode)
        // }
      }
      setVerificationCode(newVerificationCode);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            style={styles.backIcon}
            source={require('../../assets/backarrow.png')}
            accessibilityLabel="Back Button"
          />
        </TouchableOpacity>
      </View>
      <View style={verificationStyles.container}>
        <Text style={verificationStyles.timeDisplay}>{formatTime(time)}</Text>
        <Text style={verificationStyles.instructionText}>
          Type the verification code we've sent you
        </Text>
      </View>

      <View style={styles.codeContainer}>
        {verificationCode.map((code, index) => (
          <TextInput
            key={index}
            style={[
              styles.codeInput,
              code ? {backgroundColor: '#5271FF', color: 'white'} : null,
              index === focusedIndex ? {borderColor: '#5271FF'} : null,
            ]}
            onChangeText={text => handleVerificationCodeChange(text, index)}
            onFocus={() => handleFocus(index)}
            value={code}
            ref={inputRefs[index]}
            maxLength={1}
            placeholder="0"
          />
        ))}
      </View>

      <View style={styles.codeContainer}>{renderNumberPad()}</View>

      <TouchableOpacity style={againBtn.container}>
        <Text style={againBtn.text}>Send again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    justifyContent: 'space-between',
  },
  codeContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    width: 50,
    height: 50,
    margin: 5,
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  numberButton: {
    width: 70,
    height: 70,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontSize: 24,
  },
  btnContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: screenWidth * 0.8,
    alignSelf: 'flex-start',
  },
  backBtn: {
    borderWidth: 1,
    borderColor: '#E8E6EA',
    padding: 15,
    borderRadius: 15,
    width: screenHeight * 0.06,
    height: screenHeight * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 25,
    height: 25,
  },
});

const verificationStyles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    width: screenWidth * 0.7,
  },
  timeDisplay: {
    fontFamily: 'Montserrat',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 51,
  },
  instructionText: {
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
  },
});

const againBtn = StyleSheet.create({
  container: {
    marginTop: -10,
  },
  text: {
    color: '#5271FF',
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
  },
});
