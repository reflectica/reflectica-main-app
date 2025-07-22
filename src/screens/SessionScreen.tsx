import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Switch, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { SessionScreenProps } from '../constants/ParamList';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { ButtonTemplate, AnimatedButton } from '../components';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { updateDoc, doc } from 'firebase/firestore';
import { userCollection } from '../firebase/firebaseConfig';
import { useDiagnosticStatus } from '../hooks/useDiagnosticStatus'; // Import the custom hook
import { logSessionStart, logSessionEnd, logPHIAccess } from '../utils/auditLogger';
import { getSecureEndpoint, createSecureApiConfig } from '../utils/apiConfig';
import { validateUserAccess, validateSessionId, sanitizeInput } from '../utils/accessControl';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const SessionScreen: React.FC<SessionScreenProps> = ({ navigation }) => {
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const { currentUser, extendSession } = useAuth();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSpanish, setIsSpanish] = useState<boolean>(false); // Toggle between English and Spanish
  const [isREBT, setIsREBT] = useState<boolean>(true); // Toggle between CBT and REBT, REBT is default

  // Use the custom hook to check diagnostic status
  const { isDiagnostic, setIsDiagnostic, loading, error } = useDiagnosticStatus(currentUser?.uid || 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1');

  // Log session start when component mounts
  useEffect(() => {
    const logSessionStartEvent = async () => {
      if (currentUser?.uid) {
        await logSessionStart(currentUser.uid, sessionId);
        // Log PHI access for session data
        await logPHIAccess(currentUser.uid, 'therapy_session', sessionId);
      }
    };
    logSessionStartEvent();
  }, [currentUser, sessionId]);

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
    // Extend session on user interaction (HIPAA compliance)
    extendSession();
    
    if (newRecordingState) {
      await startRecording();
    } else {
      await stopRecording();
    }
  };

  const handleSubmit = async () => {
    try {
      // Extend session on user interaction (HIPAA compliance)
      extendSession();

      // HIPAA Access Control and Input Validation
      const userId = currentUser?.uid ?? 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1';
      validateUserAccess(currentUser?.uid, userId);
      
      if (!validateSessionId(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      const sanitizedTranscript = sanitizeInput(transcript);
      const therapyMode = isREBT ? 'REBT' : 'CBT';
      const diagnosticMode = isDiagnostic ? 'diagnostic' : 'therapy';

      // Log PHI access for therapy data processing
      await logPHIAccess(userId, 'therapy_conversation', sessionId);

      // Use secure HTTPS endpoint
      const apiConfig = createSecureApiConfig({
        'X-User-ID': userId,
        'X-Session-ID': sessionId,
      });

      const response = await axios.post(getSecureEndpoint('CHAT'), {
        prompt: sanitizedTranscript,
        userId: userId,
        sessionId: sessionId,
        therapyMode: therapyMode,
        sessionType: diagnosticMode,
      }, apiConfig);

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
      console.error('Session submit error:', error);
      // Log the error for audit purposes
      if (currentUser?.uid) {
        await logPHIAccess(currentUser.uid, 'therapy_conversation_error', sessionId);
      }
    }
  };

  const handleEndSession = async () => {
    try {
      // Extend session on user interaction (HIPAA compliance)
      extendSession();

      const userId = currentUser?.uid ?? 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1';
      const language = isSpanish ? 'es-ES' : 'en-US';
      const therapyMode = isREBT ? 'REBT' : 'CBT';
      const sessionType = isDiagnostic ? 'diagnostic' : 'therapy';

      // HIPAA Access Control
      validateUserAccess(currentUser?.uid, userId);

      // Log session end
      await logSessionEnd(userId, sessionId);

      // Use secure HTTPS endpoint
      const apiConfig = createSecureApiConfig({
        'X-User-ID': userId,
        'X-Session-ID': sessionId,
      });

      const response = await axios.post(getSecureEndpoint('END_SESSION'), {
        userId: userId,
        sessionId: sessionId,
        language: language,
        sessionType: sessionType,
      }, apiConfig);

      if (isDiagnostic) {
        // Mark diagnostic as completed in Firebase
        const userDocRef = doc(userCollection, userId);
        await updateDoc(userDocRef, { hasCompletedDiagnostic: true });
        setIsDiagnostic(false);
      }
      
      setSessionId(uuidv4());
      navigation.navigate('PostSession', { session: response.data });

    } catch (error) {
      console.error('End session error:', error);
      // Log the error for audit purposes
      if (currentUser?.uid) {
        await logPHIAccess(currentUser.uid, 'session_end_error', sessionId);
      }
    }
  };

  const toggleLanguage = () => {
    // Extend session on user interaction (HIPAA compliance)
    extendSession();
    setIsSpanish((prevState) => !prevState);
  };

  const toggleTherapyMode = () => {
    // Extend session on user interaction (HIPAA compliance)
    extendSession();
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
        <View style={styles.sessionContent}>
          <AnimatedButton onRecordingToggle={handleRecordingToggle} onSubmit={handleSubmit} />
        </View>

        {/* Transcript Display */}
        <Text style={styles.transcript}>
          {transcript}
        </Text>

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
