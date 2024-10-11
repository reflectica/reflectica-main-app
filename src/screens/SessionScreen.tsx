import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Switch, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { SessionScreenProps } from '../constants/ParamList';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { ButtonTemplate, AnimatedButton } from '../components';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const SessionScreen: React.FC<SessionScreenProps> = ({ navigation }) => {
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const { currentUser } = useAuth();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSpanish, setIsSpanish] = useState<boolean>(false); // Toggle between English and Spanish

  useEffect(() => {
    const onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        setTranscript(e.value.join(' '));
      }
    };

    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const language = isSpanish ? 'es-ES' : 'en-US'; // Use Spanish if toggled, else English
      await Voice.start(language);
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

  const handleRecordingToggle = async (newRecordingState: boolean) => {
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
      const filePath = `${RNFS.DocumentDirectoryPath}/audio.mp3`;

      await RNFS.writeFile(filePath, base64Audio, 'base64');
      const fileExists = await RNFS.exists(filePath);

      if (!fileExists) {
        console.error('Audio file does not exist');
        return;
      }

      Sound.setCategory('Playback');
      const sound = new Sound(filePath, '', (error) => {
        if (error) {
          console.error('Failed to load the sound', error);
          return;
        }

        sound.play((success) => {
          if (!success) {
            console.error('Playback failed due to audio decoding errors');
          }
        });
      });

      setTranscript('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleEndSession = async () => {
    const userId = currentUser?.uid ?? 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1';
    const language = isSpanish ? 'es-ES' : 'en-US'; // Use the selected language

    try {
      await axios.post('http://localhost:3006/session/endSession', {
        userId: userId,
        sessionId: sessionId,
        language: language,
      })
      .then(res => {
        setSessionId(uuidv4());
        navigation.navigate('PostSession', { session: res.data });
      })
      .catch(error => console.log(error));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleLanguage = () => {
    setIsSpanish((prevState) => !prevState);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.window}>
        {/* Language Switch */}
        <View style={styles.topRow}>
          <View style={styles.actionBox}>
            <Text style={styles.actionText}>
              {isRecording ? 'Listening...' : 'Speaking...'}
            </Text>
          </View>

          {/* Language Switcher */}
          <View style={styles.switchContainer}>
            <Text style={styles.languageText}>{isSpanish ? 'Spanish' : 'English'}</Text>
            <Switch
              value={isSpanish}
              onValueChange={toggleLanguage}
              trackColor={{ false: '#767577', true: '#5271FF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Rest of the layout */}
        <View style={styles.container}>
          <AnimatedButton onRecordingToggle={handleRecordingToggle} onSubmit={handleSubmit} />
        </View>
        <Text style={styles.transcript}>
          {transcript}
        </Text>
        <ButtonTemplate
          title="End Session"
          action={handleEndSession}
          stylebtn="purple"
          styling={{ alignSelf: 'center' }}
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
    justifyContent: 'flex-start',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  actionBox: {
    backgroundColor: '#393948',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  actionText: {
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '700',
    fontFamily: 'Montserrat',
    fontSize: 11,
    lineHeight: 16.5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10, // Space between text and switch
  },
  transcript: {
    color: 'white',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SessionScreen;
