/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import 'react-native-get-random-values';
// import {useSelector} from 'react-redux';
import {useAuth} from '../context/AuthContext.ts';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import Voice, {SpeechResultsEvent} from '@react-native-voice/voice';
// import {selectUser} from '../features/auth/authSelectors.ts'; // import the selector
import {ButtonTemplate, AnimatedButton} from '../components/index.ts';
import {SessionScreenProps} from '../constants/ParamList.ts';
// import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
// import {Audio} from 'expo-av';
// import {UserProps} from '../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const SessionScreen: React.FC<SessionScreenProps> = ({navigation}) => {
  // const [inputText, setInputText] = useState<string>('');
  // const [listening, setListening] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  // const user: UserProps = useSelector(selectUser); // use the selector to get the current user
  const {currentUser} = useAuth();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  useEffect(() => {
    // Function to handle the voice recognition results
    const onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        setTranscript(e.value.join(' ')); // Joining the array of strings into a single string
      }
    };

    // Adding the event listener
    Voice.onSpeechResults = onSpeechResults;

    // Cleanup function to remove the event listener
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordingToggle = async (newRecordingState: any) => {
    if (newRecordingState) {
      await startRecording();
    } else {
      await stopRecording();
    }
  };

  const handleSubmit = async () => {
    try {
      const promptToSubmit = transcript;

      const response = await axios.post('http://localhost:3006/chat', {
        prompt: promptToSubmit,
        userId: 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1',
        sessionId: sessionId,
      });

      const base64Audio = response.data.audio;

      // const uri = FileSystem.documentDirectory + 'audio.mp3';
      const filePath = `${RNFS.DocumentDirectoryPath}/audio.mp3`;

      await RNFS.writeFile(filePath, base64Audio, 'base64');

      // await FileSystem.writeAsStringAsync(uri, base64Audio, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });

      // const {sound} = await Audio.Sound.createAsync({uri}, {shouldPlay: true});
      // await sound.playAsync();

      // console.log('Audio playback started');
      // Play the audio
      const sound = new Sound(filePath, Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.error('Failed to load the sound', error);
          return;
        }

        sound.play(success => {
          if (success) {
            console.log('Successfully played the audio');
          } else {
            console.error('Playback failed due to audio decoding errors');
          }
        });
      });
      // setInputText('');
      setTranscript('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleEndSession = async (userId: string) => {
    try {
      await axios
        .post('http://localhost:3006/session/endSession', {
          userId: userId,
          sessionId: sessionId,
        })
        .then(res => {
          setSessionId(uuidv4());
          navigation.navigate('PostSession', {session: res.data}); // Navigate to PostSessionJournal
        })
        .catch(error => console.log(error));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.window}>
        <View style={styles.actionBox}>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: '700',
              fontFamily: 'Montserrat',
              fontSize: 11,
              lineHeight: 16.5,
            }}>
            {isRecording ? 'Listening...' : 'Speaking...'}
          </Text>
        </View>
        <View style={styles.container}>
          <AnimatedButton
            onRecordingToggle={handleRecordingToggle}
            onSubmit={handleSubmit}
          />
        </View>

        <ButtonTemplate
          title="End Session"
          action={() =>
            handleEndSession('R5Jx5iGt0EXwOFiOoGS9IuaYiRu1' || currentUser?.uid)
          }
          stylebtn={'purple'}
          styling={{alignSelf: 'center'}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 20,
  },
  window: {
    backgroundColor: '#08071A',
    height: screenHeight * 0.9,
    width: screenWidth * 0.95,
    borderRadius: 30,
    alignSelf: 'center',
    padding: 20,
  },
  notificationBoxContainer: {
    backgroundColor: '#393948',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 15,
    width: screenWidth * 0.2,
    height: screenHeight * 0.04,
    justifyContent: 'center',
  },
  notificationBox: {
    color: 'white',
    fontWeight: '700',
    fontFamily: 'Montserrat',
    fontSize: 11,
    lineHeight: 16.5,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  actionBox: {
    backgroundColor: '#393948',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  bottomContainer: {
    width: screenWidth,
    height: screenHeight,
    alignSelf: 'center',
  },
  transcript: {
    color: 'white',
    marginTop: 20,
  },
});

export default SessionScreen;
