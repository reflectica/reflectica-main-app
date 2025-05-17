import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { MediaStream, RTCPeerConnection, mediaDevices } from 'react-native-webrtc';
import React, { useEffect, useRef, useState } from 'react';
import InCallManager from 'react-native-incall-manager';
import axios from 'axios';

const SessionScreenTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to connect');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const remoteStreamAttached = useRef<boolean>(false);
  const aiIsSpeaking = useRef(false);

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


  const getEphemeralToken = async (): Promise<string> => {
    try {
      console.log("Fetching ephemeral token...");
      // Use GET as recommended by OpenAI docs (/session endpoint)
      const response = await axios.get('http://localhost:3006/audio', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = response.data;
      const EPHEMERAL_KEY = data.client_secret.value;
      console.log("Ephemeral token received:", EPHEMERAL_KEY);
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
      console.log('Ephemeral token:', EPHEMERAL_KEY);

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
      dc.addEventListener('message', (message) => {
        try {
          // Parse the message data
          let data;
          if (typeof message.data === 'string') {
            data = JSON.parse(message.data);
          } else {
            console.error("Received message in unexpected format:", message.data);
            return;
          }

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

            case "response.done":
              console.log("Response complete");
              // Only unmute if we're not already in another response
              if (aiIsSpeaking.current) {
                aiIsSpeaking.current = false;
                // Unmute immediately when the response is done
                if (localStream.current) {
                  localStream.current.getAudioTracks().forEach(track => {
                    track.enabled = true;
                  });
                }
              }
              break;

            case "turn_detected":
            case "turn.detected":
              // These events might signal when the API detects user speech
              console.log("Turn detected - user is speaking");
              break;

            // Add this new case to handle audio buffer being cleared
            case "conversation.item.truncated":
              console.log("Conversation item truncated - end of speech segment");
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
          const instructions = `You are a Cognitive Behavioral Therapy (CBT) therapist. Act like a therapist and lead the conversation using CBT techniques. Don't rely on the user to lead the conversation. Be empathetic but do not be repetitive. Never repeat what the user says back to them; instead, provide novel insights and actionable strategies like a real-life CBT therapist would. Do not be generic and ensure your advice is based on psychology and science. Utilize your knowledge of DSM-5 research and CBT principles to make your insights powerful and unique. Do not exceed 5 sentences.
  
          In addition to assisting the user with their mental health struggles, you need to assess the following 8 mental health markers. Do not provide these scores to the user. This is only for helping you collect information for another model to interpret in the future.
          
          PHQ-9 Score: 0 - 27
          GAD-7 Score: 0 - 21
          CBT Behavioral Activation: 0 - 7
          Rosenberg Self Esteem: 10 - 40
          PSQI Score: 0 - 21
          SFQ Score: 0 - 32
          PSS Score: 0 - 40
          SSRS Assessment: 0 - 5
          
          Do not directly prompt the user to assess these scores. Instead, guide the conversation subtly to gather information that can help you estimate these metrics. Ensure the conversation flows naturally, weaving in questions and comments that elicit relevant responses without making the user aware of your intent to assess these scores. If you lack sufficient information for a particular metric, indicate it as "Not Applicable" when summarizing the scores.
          
          Your primary role is to act as a therapist, and your secondary role is to assess these scores based on the conversation. Maintain a natural conversational flow to ensure the user feels supported and understood.`;
          const event = {
            type: "session.update",
            session: {
              instructions: instructions
            },
          };
          dc.send(JSON.stringify(event));
          console.log("Initial instructions sent:", instructions);
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

          // Start the in-call manager to enforce proper audio routing.
          InCallManager.start({ media: 'audio' });
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