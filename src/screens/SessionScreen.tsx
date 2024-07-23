import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Button,
  Text,
  View,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import 'react-native-get-random-values';
// import {useSelector} from 'react-redux';
import {useAuth} from '../context/AuthContext.js';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import Voice from '@react-native-voice/voice';
// import {selectUser} from '../features/auth/authSelectors.js'; // import the selector
import {ButtonTemplate} from '../components/index.js';
// import * as FileSystem from 'expo-file-system';
// import {Audio} from 'expo-av';
// import {UserProps} from '../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function SessionScreen() {
  // const [inputText, setInputText] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  // const user: UserProps = useSelector(selectUser); // use the selector to get the current user
  const {currentUser} = useAuth();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  useEffect(() => {
    // Function to handle the voice recognition results
    const onSpeechResults = (e: {value: string[]}) => {
      setTranscript(e.value.join(' ')); // Joining the array of strings into a single string
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

  // const handleSubmit = async () => {
  //   try {
  //     // Use the transcript as the prompt for the request
  //     const promptToSubmit = transcript; // Assuming transcript holds the recorded text

  //     // Send the request and wait for the response
  //     const response = await axios.post('http://localhost:3006/chat', {
  //       prompt: promptToSubmit,
  //       userId: 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1',
  //       sessionId: sessionId,
  //     });

  //     // audio data in base64 format
  //     const base64Audio = response.data.audio;

  //     // Prepare the URI for the audio file
  //     const uri = FileSystem.documentDirectory + 'audio.mp3';

  //     // Convert base64 to a file and save
  //     await FileSystem.writeAsStringAsync(uri, base64Audio, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });

  //     // Playback the saved audio file
  //     const {sound} = await Audio.Sound.createAsync({uri}, {shouldPlay: true});
  //     await sound.playAsync();

  //     console.log('Audio playback started');

  //     setInputText(''); // If you're managing the input separately, clear it.
  //     setTranscript(''); // Clear the transcript after the request is completed and audio played.
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleEndSession = async (userId: string) => {
    await axios
      .post('http://localhost:3006/session/endSession', {
        userId: userId,
        sessionId: sessionId,
      })
      .then(_res => {
        setSessionId(uuidv4());
      })
      .catch(error => console.log(error));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.window}>
        <View style={styles.actionBox}>
          <Text style={styles.listeningText}>
            {listening ? 'Listening...' : 'Speaking...'}
          </Text>
        </View>
        <View style={styles.container}>
          <Button
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
            onPress={isRecording ? stopRecording : startRecording}
          />
          {/* STYLE doesn't exist for 'transcript' */}
          <Text style={styles.transcript}>Transcript: {transcript}</Text>
        </View>
        {/* <ButtonTemplate title='Send' action={handleSubmit} stylebtn={'purple'} styling={{alignSelf:'center'}} /> */}
        <ButtonTemplate
          title="End Session"
          action={() =>
            handleEndSession('R5Jx5iGt0EXwOFiOoGS9IuaYiRu1' || currentUser.uid)
          }
          stylebtn={'purple'}
          styling={{alignSelf: 'center'}}
        />
      </View>
    </SafeAreaView>
  );
}

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
    // display: 'relative',
    // top: 670,
    width: screenWidth,
    height: screenHeight,
    alignSelf: 'center',
  },
  listeningText: {
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '700',
    fontFamily: 'Montserrat',
    fontSize: 11,
    lineHeight: 16.5,
  },
  transcript: {},
});
