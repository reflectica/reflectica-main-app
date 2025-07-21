import { ActivityIndicator, Dimensions, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
// import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { AnimatedButton, ButtonTemplate } from '../components';
import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

import RNFS from 'react-native-fs';
import { SessionScreenProps } from '../constants/ParamList';
import Sound from 'react-native-sound';
import { updateDoc, doc } from '@react-native-firebase/firestore';
import { userCollection } from '../firebase/firebaseConfig';
import { useDiagnosticStatus } from '../hooks/useDiagnosticStatus'; // Import the custom hook
import { userCollection } from '../firebase/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const SessionScreen: React.FC<SessionScreenProps> = ({ navigation }) => {
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const { currentUser } = useAuth();
  // const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSpanish, setIsSpanish] = useState<boolean>(false); // Toggle between English and Spanish
  const [isREBT, setIsREBT] = useState<boolean>(true); // Toggle between CBT and REBT, REBT is default

  // Use the custom hook to check diagnostic status
  const { isDiagnostic, setIsDiagnostic, loading, error } = useDiagnosticStatus(currentUser?.uid || 'gADXwFiz2WfZaMgWLrffyr7Ookw2');

  // useEffect(() => {
  //   const onSpeechResults = (e: SpeechResultsEvent) => {
  //     if (e.value) {
  //       setTranscript(e.value.join(' '));
  //     }
  //   };

  //   Voice.onSpeechResults = onSpeechResults;

  //   return () => {
  //     Voice.destroy().then(Voice.removeAllListeners);
  //   };
  // }, []);

  // const startRecording = async () => {
  //   try {
  //     setIsRecording(true);
  //     const language = isSpanish ? 'es-ES' : 'en-US'; // Use Spanish if toggled, else English
  //     await Voice.start(language);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const stopRecording = async () => {
  //   try {
  //     await Voice.stop();
  //     setIsRecording(false);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const handleRecordingToggle = async (newRecordingState: boolean) => {
  //   if (newRecordingState) {
  //     await startRecording();
  //   } else {
  //     await stopRecording();
  //   }
  // };

  const downloadBase64AndStore = async (base64String: string) => {
    try {
      const localPath = `${RNFS.DocumentDirectoryPath}/chat.wav`;
      await RNFS.writeFile(localPath, base64String, 'base64');
      console.log('Successfully saved WAV file at:', localPath);
      return localPath;
    } catch (error) {
      console.error('Error writing WAV file:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const promptToSubmit = transcript;
      const therapyMode = isREBT ? 'REBT' : 'CBT'; // Determine therapy mode
      const userId = currentUser?.uid ?? 'gADXwFiz2WfZaMgWLrffyr7Ookw2'; // Replace with dynamic user ID if available
      const diagnosticMode = isDiagnostic ? 'diagnostic' : 'therapy'; // Determine session type

      const response = await axios.post('http://localhost:3006/chat', {
        prompt: promptToSubmit,
        userId: userId,
        sessionId: sessionId,
        therapyMode: therapyMode, // Send therapy mode
        sessionType: diagnosticMode, // Send session type
      });



    const base64Data = response.data.audio; // If your backend returns Base64 directly

    // Log the first 100 characters of the Base64 data for debugging
    console.log('Base64 Audio Data (first 100 chars):', base64Data.substring(0, 100));

    if (base64Data && typeof base64Data === 'string') {
      const localPath = await downloadBase64AndStore(base64Data);
      // Play the file from localPath using react-native-sound
      Sound.setCategory('Playback');
      const sound = new Sound(localPath, '', (error) => {
        if (error) {
          console.error('Failed to load sound', error);
          return;
        }
        sound.play((success) => {
          if (success) {
            console.log('Successfully played the sound');
          } else {
            console.error('Playback failed');
          }
        });
      });
    }

    setTranscript('');
  } catch (error) {
    console.error(error);
  }
};

  const handleEndSession = async () => {
    const userId = currentUser?.uid ?? 'gADXwFiz2WfZaMgWLrffyr7Ookw2';
    const language = isSpanish ? 'es-ES' : 'en-US'; // Use the selected language
    const therapyMode = isREBT ? 'REBT' : 'CBT'; // Use the selected therapy mode
    const sessionType = isDiagnostic ? 'diagnostic' : 'therapy'; // Determine session type

    try {
      await axios.post('http://localhost:3006/session/endSession', {
        userId: userId,
        sessionId: sessionId,
        language: language,
        sessionType: sessionType, // Send session type
      })
        .then(async res => {
          if (isDiagnostic) {
            // Mark diagnostic as completed in Firebase
            const userDocRef = doc(userCollection, userId);
            await updateDoc(userDocRef, { hasCompletedDiagnostic: true });
            setIsDiagnostic(false);
          }
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

  const toggleTherapyMode = () => {
    setIsREBT((prevState) => !prevState);
  };

  // Render loading or error states if necessary
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.window}>
          <ActivityIndicator size="large" color="#5271FF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.window}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.window}>
        {/* Top Row: Back Button and Switches */}
        <View style={styles.topRow}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* Switches Container */}
          <View style={styles.switchesContainer}>
            {/* Language Switcher */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabelText}>{isSpanish ? 'Spanish' : 'English'}</Text>
              <Switch
                value={isSpanish}
                onValueChange={toggleLanguage}
                trackColor={{ false: '#767577', true: '#5271FF' }}
                thumbColor="#fff"
                accessibilityLabel="Toggle Language"
                accessibilityHint="Switch between English and Spanish"
              />
            </View>

            {/* Therapy Mode Switcher */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabelText}>{isREBT ? 'REBT' : 'CBT'}</Text>
              <Switch
                value={isREBT}
                onValueChange={toggleTherapyMode}
                trackColor={{ false: '#767577', true: '#5271FF' }}
                thumbColor="#fff"
                accessibilityLabel="Toggle Therapy Mode"
                accessibilityHint="Switch between CBT and REBT therapy modes"
              />
            </View>
          </View>
        </View>

        {/* Rest of the layout */}
        {/* <View style={styles.sessionContent}>
          <AnimatedButton onRecordingToggle={handleRecordingToggle} onSubmit={handleSubmit} />
        </View> */}

        {/* Transcript Display */}


        {/* End Session Button */}
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
    // Ensure the SafeAreaView takes up the full screen
    backgroundColor: '#f0f0f0',
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
    paddingHorizontal: 0, // Remove horizontal padding to align switches properly
    width: '100%',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'transparent', // Transparent background
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchesContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Space between switches
  },
  switchLabelText: {
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10, // Space between text and switch
  },
  sessionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: '#5271FF',
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginTop: 10,
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
