import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { MediaStream, RTCPeerConnection, mediaDevices } from 'react-native-webrtc';
import React, { useEffect, useRef, useState } from 'react';

import { ButtonTemplate } from '../components';
import { SessionScreenProps } from '../constants/ParamList';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const SessionScreenTest: React.FC<SessionScreenProps> = ({ navigation }) => {
  const [status, setStatus] = useState<string>('Ready to connect');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const { currentUser } = useAuth();
  const remoteStreamAttached = useRef<boolean>(false);
  const aiIsSpeaking = useRef(false);
  const language = 'en-US'
  const therapyMode = 'CBT'; // Determine therapy mode
  const userId = currentUser?.uid ?? 'gADXwFiz2WfZaMgWLrffyr7Ookw2'; // Replace with dynamic user ID if available
  const sessionType = 'therapy'

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      console.log("Cleaning up connection...");
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [peerConnection]);

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
    } catch (error) {
      console.error('Error posting transcript:', error);
    }
  };
  const handleEndSession = async () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
      console.log("Peer connection closed.");
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
      console.log("Local stream stopped.");
    }
    if (remoteStream.current) {
      remoteStream.current.getTracks().forEach(track => track.stop());
      remoteStream.current = null;
      console.log("Remote stream stopped.");
    }

    try {
      await axios.post('http://localhost:3006/session/endSession', {
        userId: userId,
        sessionId: sessionId,
        language: language,
        sessionType: sessionType, // Send session type
      })
        .then(async res => {

          setSessionId(uuidv4());
          navigation.navigate('PostSession', { session: res.data });
        })
        .catch(error => console.log(error));
    } catch (error) {
      console.error(error);
    }
  };

  const getEphemeralToken = async (): Promise<string> => {
    try {
      console.log("Fetching ephemeral token...");
      // Use GET as recommended by OpenAI docs (/session endpoint)
      const response = await axios.get('http://localhost:3006/audio', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = response.data;
      const EPHEMERAL_KEY = data.client_secret.value;

      return EPHEMERAL_KEY;
    } catch (error) {
      console.error('Token fetch error:', error);
      throw error;
    }
  };

  const init = async () => {
    try {
      setStatus('Requesting ephemeral token...');
      const EPHEMERAL_KEY = await getEphemeralToken();

      // Create a new RTCPeerConnection
      const pc = new RTCPeerConnection();
      setPeerConnection(pc);
      console.log("RTCPeerConnection created.");

      // Get local audio (microphone) track with explicit constraints.
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as any,
        video: false
      });
      localStream.current = stream;
      console.log("Local audio stream obtained:", stream);

      // Add local audio track to the peer connection.
      stream.getAudioTracks().forEach((track) => {
        console.log("Adding local track:", track);
        pc.addTrack(track, stream);
      });

      let dc = pc.createDataChannel('oai-events');
      dc.addEventListener('open', () => {
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            input_audio_transcription: { model: 'whisper-1' },  // final + delta events
            turn_detection: {
              type: "semantic_vad",
              eagerness: "low", // optional
              create_response: true, // only in conversation mode
              interrupt_response: true, // only in conversation mode
            }
          }
        }));
      });
      dc.addEventListener('message', (message) => {
        try {
          // Parse the message data
          const data = typeof message.data === 'string' ? JSON.parse(message.data) : null;
          if (!data) return;

          // Handle message based on type
          switch (data.type) {
            // Other cases remain the same...

            case "output_audio_buffer.started":
              console.log("Audio playback started");
              aiIsSpeaking.current = true;
              // Mute your microphone immediately when AI starts speaking
              if (localStream.current) {
                localStream.current.getAudioTracks().forEach(track => {
                  track.enabled = false;
                });
              }
              break;

            case "output_audio_buffer.cleared":
              // This event signals when the output buffer is cleared, which is important
              console.log("Audio buffer cleared - speech is likely finished");
              // We'll still wait for response.done to unmute
              break;
            case "conversation.item.input_audio_transcription.completed":

              postTranscript(userId, sessionId, 'user', data.transcript);
              // This is typically the event you'll use to store or process final user utterances
              break;
            case "response.done": {
              console.log("Response complete");

              // The full response object is under data.response
              const outputs = data.response?.output;
              if (Array.isArray(outputs)) {
                outputs.forEach(item => {
                  // Each item may have a content array
                  if (Array.isArray(item.content)) {
                    // Each content element can have type="audio" or type="text"
                    item.content.forEach((contentPart: { type: string; transcript: any; text: any; }) => {
                      if (contentPart.type === "audio" && contentPart.transcript) {
                        // Print the transcript of the audio content

                        postTranscript(userId, sessionId, 'assistant', contentPart.transcript);
                      } else if (contentPart.type === "text" && contentPart.text) {
                        // Print plain text content
                        console.log("AI text response:", contentPart.text);
                      }
                    });
                  }
                });
              }

              // Unmute logic (only if currently speaking, etc.)
              if (aiIsSpeaking.current) {
                aiIsSpeaking.current = false;
                // Unmute the mic if needed
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
              // These events might signal when the API detects user speech
              console.log("Turn detected - user is speaking");
              break;

            // Add this new case to handle audio buffer being cleared
            case "conversation.item.truncated":

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
        console.log("Offer created:", offerDescription);
        await pc.setLocalDescription(offerDescription);
        console.log("Local description set.");

        // Send the offerDescription to the other participant.
        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        console.log("Posting offer to:", `${baseUrl}?model=${model}`);
        const sdpResponse = await axios.post(
          `${baseUrl}?model=${model}`,
          offerDescription.sdp,
          {
            headers: {
              Authorization: `Bearer ${EPHEMERAL_KEY}`,
              "Content-Type": "application/sdp",
            },
          }
        );
        console.log("SDP response received:", sdpResponse.data);
        const answer = {
          type: "answer",
          sdp: sdpResponse.data,
        };
        await pc.setRemoteDescription(answer);
        console.log("Remote description set.");
        // Add this code to send instructions after connection is established
        setTimeout(() => {
          const instructions = `Conduct a diagnostic therapy session to gather information needed for DSM-5-related scores, including PHQ-9, GAD-7, CBT Behavioral Activation, Rosenberg Self-Esteem, PSQI, SFQ, PSS, and SSRS, while maintaining a natural, empathetic flow.

      The focus is on collecting data efficiently for diagnostic scoring purposes. Balance empathy with the objective of obtaining enough information to calculate each score accurately. Capture user responses and transition smoothly between predefined questions for each assessment area.

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
          const event = {
            type: "session.update",
            session: {
              instructions: instructions
            },
          };
          dc.send(JSON.stringify(event));
        }, 1000); // Wait a short time for the connection to stabilize
      } catch (err) {
        console.error("Error during offer/answer exchange", err);
      }

      // Set up remote audio handling using the ontrack event.
      // Only set the remote stream once.
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

      setStatus("Peer connection created, audio tracks set up.");
    } catch (error: any) {
      console.error("Error initializing session:", error);
      Alert.alert("Error", error.message);
      setStatus("Error initializing session");
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real-time AI Voice Chat</Text>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Start Session" onPress={init} />
        {/* <Button title={isMuted ? 'Unmute' : 'Mute'} onPress={toggleAudio} /> */}
      </View>
      <ButtonTemplate
        title="End Session"
        action={handleEndSession}
        stylebtn="purple"
        styling={{ alignSelf: 'center' }}
      />
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
    marginBottom: 20,
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
