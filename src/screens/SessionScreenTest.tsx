import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { MediaStream, RTCPeerConnection, RTCDataChannel, mediaDevices } from 'react-native-webrtc';
import React, { useEffect, useRef, useState } from 'react';
import { BottomTranscript } from '../components';
import { ButtonTemplate } from '../components';
import { SessionScreenProps } from '../constants/ParamList';
import { useRoute, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import firestore from '@react-native-firebase/firestore';

type TranscriptItem = { speaker: 'user' | 'assistant'; text: string };

type SessionParams = {
  sessionType: 'diagnostic' | 'guidedTherapy';
};

type SessionRouteProp = RouteProp<Record<string, SessionParams>, string>;

const SessionScreenTest: React.FC<SessionScreenProps> = ({ navigation }) => {
  const route = useRoute<SessionRouteProp>();
  const sessionTypeParam = route.params?.sessionType || 'diagnostic';
  
  // State management
  const [status, setStatus] = useState<string>('Ready to connect');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [ephemeralToken, setEphemeralToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Refs for streams and connection state
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const remoteStreamAttached = useRef<boolean>(false);
  const aiIsSpeaking = useRef(false);
  
  // Constants
  const { currentUser } = useAuth();
  const language = 'en-US';
  const therapyMode = 'CBT';
  const userId = currentUser?.uid || 'anonymous';
  const sessionType = sessionTypeParam === 'guidedTherapy' ? 'therapy' : 'diagnostic';

  // Reset all connection state
  const resetConnectionState = () => {
    console.log('🔄 Resetting all connection state...');
    
    setEphemeralToken(null);
    setIsConnecting(false);
    setStatus('Ready to connect');
    setTranscript([]);
    remoteStreamAttached.current = false;
    aiIsSpeaking.current = false;
    
    // Close data channel if exists
    if (dataChannel.current) {
      console.log('🧹 Closing data channel...');
      dataChannel.current.close();
      dataChannel.current = null;
    }
    
    console.log('✅ All connection state reset');
  };

  // Function to get referral recommendation from last session
  const getReferralRecommendation = async (): Promise<string | null> => {
    try {
      console.log('🔍 Fetching referral recommendation for user:', userId);
      
      const querySnapshot = await firestore()
        .collection('summaries')
        .where('uid', '==', userId)
        .orderBy('time', 'desc')
        .limit(1)
        .get();
      
      if (querySnapshot.empty) {
        console.log('❌ No previous sessions found for user:', userId);
        return null;
      }
      
      const lastSessionData = querySnapshot.docs[0].data();
      const referralRecommendation = lastSessionData.referralRecommendation;
      
      console.log('✅ Last session data found:', {
        sessionId: lastSessionData.sessionId,
        hasReferralRecommendation: !!referralRecommendation,
        referralRecommendationLength: referralRecommendation?.length || 0
      });
      
      if (referralRecommendation) {
        console.log('📝 Referral Recommendation Content:', referralRecommendation);
        return referralRecommendation;
      } else {
        console.log('⚠️ No referralRecommendation field found in last session');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error fetching referral recommendation:', error);
      return null;
    }
  };

  // Generate instructions based on session type
  const generateInstructions = async (): Promise<string> => {
    console.log('🎯 Generating instructions for session type:', sessionTypeParam);
    
    if (sessionTypeParam === 'diagnostic') {
      console.log('📋 Using diagnostic instructions');
      return `Conduct a diagnostic therapy session to gather information needed for DSM-5-related scores, including PHQ-9, GAD-7, CBT Behavioral Activation, Rosenberg Self-Esteem, PSQI, SFQ, PSS, and SSRS, while maintaining a natural, empathetic flow.

The focus is on collecting data efficiently for diagnostic scoring purposes. Balance empathy with the objective of obtaining enough information to calculate each score accurately. Capture user responses and transition smoothly between predefined questions for each assessment area.
Make sure to cover all these steps before providing any recommendations or conclusions. Do not make responses too long or complex.
# Steps

1. **Warm-up and Introduction**: Begin with a brief and empathetic introductory conversation to make the user comfortable.
2. **PHQ-9 and GAD-7 Assessment**: Ask questions related to depression and anxiety symptoms, allowing the user to elaborate naturally.
3. **CBT Behavioral Activation**: Guide the user through discussions about their daily activities and levels of motivation.
4. **Rosenberg Self-Esteem Scale**: Explore the user's self-perception and feelings of self-worth.
5. **PSQI**: Discuss sleep patterns, quality, and disturbances.
6. **SFQ, PSS, SSRS**: Cover questions about social functioning, perceived stress, and social support networks.
7. **Conclusion**: Summarize the session briefly, ensuring the user feels heard and understood.

# Output Format

The session should result in a structured dataset, ideally captured as JSON or organized text, that includes user-provided details necessary for each of the scales (PHQ-9, GAD-7, CBT Behavioral Activation, Rosenberg Self-Esteem, PSQI, SFQ, PSS, SSRS).

# Examples

*Example Start of Session*:
- **Therapist**: "Hello [User], it's nice to meet you. I'm here to understand your experiences better, particularly about how you've been feeling recently. Would you be comfortable sharing about your recent moods?"
  
*Transition Example*:
- **Therapist**: (after hearing about mood) "That's really helpful to know. You mentioned feeling anxious sometimes. Could you tell me more about how often you feel this way and any factors you think contribute to it?"

(Ensure examples remain flexible to real session lengths and depth)

# Notes

- Be mindful of the user's emotional state, and provide reassurances as necessary to maintain comfort.
- If the user is uncomfortable or unwilling to answer certain questions, acknowledge their feelings and gently guide them to another topic.
- Use open-ended questions, and listen actively to encourage a detailed response.
- Always loop back to ensure that enough information has been gathered to assess each specific score without making the session feel rushed.`;
    } else {
      // Guided therapy - get referral recommendation
      console.log('🎭 Generating guided therapy instructions');
      const referralRecommendation = await getReferralRecommendation();
      
      if (referralRecommendation) {
        console.log('✅ Using referral recommendation for guided therapy');
        return `Conduct a personalized, guided CBT (Cognitive Behavioral Therapy) session based on the following diagnostic notes and recommendations:

DIAGNOSTIC NOTES AND RECOMMENDATIONS:
${referralRecommendation}

# Session Objectives

Based on the diagnostic information above, conduct a therapeutic session that:
1. **Addresses specific concerns** identified in the diagnostic notes
2. **Implements CBT techniques** tailored to the user's needs
3. **Builds on previous insights** and recommendations
4. **Provides practical tools** for managing identified issues

# CBT Approach Guidelines

1. **Collaborative Relationship**: Work together with the user to explore thoughts, feelings, and behaviors
2. **Thought Challenging**: Help identify and challenge negative or unhelpful thought patterns
3. **Behavioral Activation**: Encourage engagement in meaningful activities and behavioral changes
4. **Skill Building**: Teach coping strategies and practical tools
5. **Homework/Action Steps**: Suggest concrete steps the user can take between sessions

# Session Structure

1. **Check-in**: Start by asking how the user has been since the diagnostic session
2. **Review Recommendations**: Gently reference and build upon the diagnostic insights
3. **Focused Work**: Dive deeper into 1-2 key areas identified in the diagnostic
4. **Skill Practice**: Introduce or practice specific CBT techniques
5. **Action Planning**: End with concrete next steps or practices for the user

# Therapeutic Techniques to Consider

- Cognitive restructuring
- Behavioral experiments
- Activity scheduling
- Mindfulness and grounding techniques
- Problem-solving strategies
- Relaxation techniques

# Notes

- Reference the diagnostic notes naturally and therapeutically
- Focus on the user's strengths and resilience
- Maintain a supportive, non-judgmental atmosphere
- Adapt the session based on the user's current emotional state
- Encourage progress while being realistic about the therapeutic process`;
      } else {
        console.log('⚠️ No referral recommendation found, using general guided therapy instructions');
        return `Conduct a personalized, guided CBT (Cognitive Behavioral Therapy) session. Since no specific diagnostic notes are available, focus on:

# General CBT Session Objectives

1. **Assessment**: Understand the user's current concerns and goals
2. **CBT Education**: Introduce CBT concepts and their therapeutic value
3. **Skill Building**: Teach practical CBT techniques
4. **Application**: Help the user apply these techniques to their specific situation

# Session Structure

1. **Initial Assessment**: Explore current challenges, mood, and goals
2. **CBT Introduction**: Explain the connection between thoughts, feelings, and behaviors
3. **Technique Introduction**: Introduce 1-2 CBT techniques relevant to their concerns
4. **Practice**: Guide the user through applying these techniques
5. **Action Planning**: Develop concrete steps for practicing between sessions

# CBT Techniques to Consider

- Thought records and cognitive restructuring
- Behavioral activation and activity scheduling
- Mindfulness and grounding exercises
- Problem-solving strategies
- Relaxation and breathing techniques

# Notes

- Maintain a collaborative, supportive approach
- Focus on the user's strengths and existing coping strategies
- Provide hope and encouragement for the therapeutic process
- Adapt techniques based on the user's response and needs`;
      }
    }
  };

  // Helper function to post a transcript to local server
  const postTranscript = async (
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    message: string
  ) => {
    try {
      await axios.post('http://localhost:3006/audio/transcript', {
        userId,
        sessionId,
        role,
        message,
      });
      console.log(`[${role}] transcript posted:`, message);

      // Update local state for transcript
      setTranscript((prev) => [...prev, { speaker: role, text: message }]);
    } catch (error) {
      console.error('Error posting transcript:', error);
    }
  };

  // Get fresh ephemeral token
  const getEphemeralToken = async (): Promise<string> => {
    try {
      console.log("🔄 Fetching NEW ephemeral token from backend...");
      const response = await axios.get('http://localhost:3006/audio', {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      
      console.log("📋 Backend response:", {
        status: response.status,
        hasData: !!response.data,
        hasClientSecret: !!response.data?.client_secret,
        hasValue: !!response.data?.client_secret?.value
      });
      
      const data = response.data;
      const EPHEMERAL_KEY = data.client_secret.value;
      
      if (!EPHEMERAL_KEY) {
        throw new Error('No ephemeral key received from backend');
      }
      
      console.log("✅ NEW ephemeral key received, length:", EPHEMERAL_KEY.length);
      setEphemeralToken(EPHEMERAL_KEY);
      return EPHEMERAL_KEY;
    } catch (error: any) {
      console.error('❌ Token fetch error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  };

  // Comprehensive cleanup function
  const cleanupConnection = () => {
    console.log('🧹 Starting comprehensive connection cleanup...');
    
    // Close peer connection first
    if (peerConnection) {
      console.log('🔌 Closing peer connection...');
      peerConnection.close();
      setPeerConnection(null);
    }
    
    // Close data channel
    if (dataChannel.current) {
      console.log('📡 Closing data channel...');
      dataChannel.current.close();
      dataChannel.current = null;
    }
    
    // Stop all local stream tracks
    if (localStream.current) {
      console.log('🎤 Stopping local stream tracks...');
      localStream.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped local track:', track.kind);
      });
      localStream.current = null;
    }
    
    // Stop all remote stream tracks
    if (remoteStream.current) {
      console.log('🔊 Stopping remote stream tracks...');
      remoteStream.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped remote track:', track.kind);
      });
      remoteStream.current = null;
    }
    
    // Reset all flags and state
    resetConnectionState();
    
    console.log('✅ Comprehensive cleanup completed');
  };

  const handleEndSession = async () => {
    console.log('🏁 Ending session...');
    
    // Cleanup all connections first
    cleanupConnection();

    try {
      console.log('🏁 Ending session with type:', sessionType);
      await axios.post('http://localhost:3006/session/endSession', {
        userId: userId,
        sessionId: sessionId,
        language: language,
        sessionType: sessionType,
      })
        .then(async res => {
          // Generate new session ID for next session
          setSessionId(uuidv4());
          console.log('✅ Session ended successfully, navigating to PostSession');
          navigation.navigate('PostSession', { session: res.data });
        })
        .catch(error => {
          console.error('❌ Error ending session:', error);
        });
    } catch (error) {
      console.error('❌ Session end error:', error);
    }
  };
// Add this test function before the init function
// Update the testNetworkConnectivity function:
const testNetworkConnectivity = async () => {
  console.log('🧪 Testing network connectivity...');
  
  try {
    // Test 1: Basic HTTP request
    const test1 = await axios.get('https://httpbin.org/get', { timeout: 5000 });
    console.log('✅ Test 1 - Basic HTTPS works:', test1.status);
    
    // Test 2: Test your own backend
    const test2 = await axios.get('http://localhost:3006/audio', { timeout: 5000 });
    console.log('✅ Test 2 - Backend works:', test2.status);
    
    // Skip direct OpenAI test since we're using proxy
    console.log('📡 Will use backend proxy for OpenAI requests');
    
    return true;
  } catch (error: any) {
    console.log('❌ Network test failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });
    return false;
  }
};
  const init = async () => {
    if (!instructions) {
      console.log('⏳ Instructions not ready yet, waiting...');
      return;
    }

    if (isConnecting) {
      console.log('⏳ Already connecting, please wait...');
      return;
    }

    try {
      setIsConnecting(true);
      setStatus('Requesting fresh ephemeral token...');
          
    // Test network first
    const networkOk = await testNetworkConnectivity();
    if (!networkOk) {
      Alert.alert("Network Issue", "Cannot connect to external services. Please check your internet connection.");
      return;
    }
      // Clean up any existing connections first
      cleanupConnection();

      // Get fresh token
      const EPHEMERAL_KEY = await getEphemeralToken();

      console.log('🚀 Starting fresh session with new token...');
      const pc = new RTCPeerConnection();
      setPeerConnection(pc);
      console.log("✅ Fresh RTCPeerConnection created");

      // Get fresh audio stream
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as any,
        video: false
      });
      localStream.current = stream;
      console.log("✅ Fresh local audio stream obtained");

      // Add local audio track to the peer connection
      stream.getAudioTracks().forEach(track => {
        console.log("➕ Adding fresh local track:", track.kind);
        pc.addTrack(track, stream);
      });

      // Create fresh data channel
      let dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc; // Store reference for cleanup
      
      dc.addEventListener('open', () => {
        console.log('📡 Data channel opened');
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: {
              type: "semantic_vad",
              eagerness: "medium",
              create_response: true,
              interrupt_response: true,
            }
          }
        }));
      });

      dc.addEventListener('message', (message) => {
        try {
          const data = typeof message.data === 'string' ? JSON.parse(message.data) : null;
          if (!data) return;

          switch (data.type) {
            case "output_audio_buffer.started":
              console.log("Audio playback started");
              aiIsSpeaking.current = true;
              if (localStream.current) {
                localStream.current.getAudioTracks().forEach(track => {
                  track.enabled = false;
                });
              }
              break;

            case "output_audio_buffer.cleared":
              console.log("Audio buffer cleared - speech is likely finished");
              break;

            case "conversation.item.input_audio_transcription.completed":
              // This event typically includes the final user utterance
              postTranscript(userId, sessionId, 'user', data.transcript);
              break;

            case "response.done": {
              console.log("Response complete");
              const outputs = data.response?.output;
              if (Array.isArray(outputs)) {
                outputs.forEach(item => {
                  if (Array.isArray(item.content)) {
                    item.content.forEach((contentPart: { type: string; transcript?: string; text?: string }) => {
                      if (contentPart.type === "audio" && contentPart.transcript) {
                        postTranscript(userId, sessionId, 'assistant', contentPart.transcript);
                      } else if (contentPart.type === "text" && contentPart.text) {
                        console.log("AI text response:", contentPart.text);
                        postTranscript(userId, sessionId, 'assistant', contentPart.text);
                      }
                    });
                  }
                });
              }
              if (aiIsSpeaking.current) {
                aiIsSpeaking.current = false;
                if (localStream.current) {
                  localStream.current.getAudioTracks().forEach(track => {
                    track.enabled = true;
                  });
                }
              }
              break;
            }

            case "turn_detected":
            case "turn.detected":
              console.log("Turn detected - user is speaking");
              break;

            case "conversation.item.truncated":
              // End of user speech chunk
              break;
          }
        } catch (err) {
          console.error("Error parsing data channel message:", err);
        }
      });

      let sessionConstraints = {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: false,
          VoiceActivityDetection: true,
        },
      };

      try {
        console.log("Creating offer with constraints:", sessionConstraints);
        const offerDescription = await pc.createOffer(sessionConstraints);
        console.log("Offer created, SDP length:", offerDescription.sdp?.length);
        await pc.setLocalDescription(offerDescription);
        console.log("Local description set.");

        const model = "gpt-4o-realtime-preview";
        console.log("Posting offer via backend proxy...");
        
        // Use backend proxy instead of direct OpenAI call
        const sdpResponse = await axios.post(
          'http://localhost:3006/audio/openai-proxy',
          {
            sdp: offerDescription.sdp,
            model: model,
            ephemeralKey: EPHEMERAL_KEY
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
          }
        );
        
        console.log("✅ SDP response received successfully");
        const answer = { type: "answer", sdp: sdpResponse.data };
        await pc.setRemoteDescription(answer);
        console.log("Remote description set.");

        // Send dynamic instructions
        setTimeout(() => {
          console.log('📤 Sending instructions to AI:', {
            sessionType: sessionTypeParam,
            instructionsLength: instructions.length,
            instructionsPreview: instructions.substring(0, 100) + '...'
          });
          
          const event = {
            type: "session.update",
            session: {
              instructions: instructions
            },
          };
          dc.send(JSON.stringify(event));
        }, 1000);

      } catch (err: any) {
        console.error("❌ Error during offer/answer exchange:", err);
        Alert.alert("Connection Error", `Failed to connect to OpenAI: ${err.message}`);
        setStatus("Connection failed");
        return;
      }

      pc.addEventListener("track", (event) => {
        console.log("Received remote track event:", event);
        if (!remoteStreamAttached.current && event.streams && event.streams[0]) {
          remoteStream.current = event.streams[0];
          remoteStreamAttached.current = true;
          console.log("Remote stream set:", remoteStream.current);
        } else {
          console.log("Duplicate remote track event ignored.");
        }
      });

      setStatus("Connected and ready for conversation");

    } catch (error: any) {
      console.error("❌ Error initializing session:", error);
      Alert.alert("Error", error.message);
      setStatus("Error initializing session");
    } finally {
      setIsConnecting(false);
    }
  };

  // Initialize instructions when component mounts
  useEffect(() => {
    generateInstructions().then(setInstructions);
  }, [sessionTypeParam, userId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting, cleaning up...");
      cleanupConnection();
    };
  }, []);

  // Reset when session type changes
  useEffect(() => {
    console.log('🔄 Session type changed, resetting state...');
    resetConnectionState();
  }, [sessionTypeParam]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reflectica AI</Text>
      <Text style={styles.subtitle}>
        Session Type: {sessionTypeParam === 'diagnostic' ? 'Diagnostic Assessment' : 'Personalized Therapy'}
      </Text>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title={isConnecting ? "Connecting..." : "Start Session"} 
          onPress={init} 
          disabled={!instructions || isConnecting}
        />
      </View>
      <ButtonTemplate
        title="End Session"
        action={handleEndSession}
        stylebtn="purple"
        styling={{ alignSelf: 'center' }}
      />
      <BottomTranscript transcript={transcript} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default SessionScreenTest;