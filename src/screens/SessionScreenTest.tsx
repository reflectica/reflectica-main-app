import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { MediaStream, RTCPeerConnection, mediaDevices } from 'react-native-webrtc';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const SessionScreenTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to connect');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

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
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
        },
        video: false,
      });
      localStream.current = stream;
      console.log("Local audio stream obtained:", stream);

      // Add local audio track to the peer connection.
      stream.getAudioTracks().forEach((track) => {
        console.log("Adding local track:", track);
        pc.addTrack(track, stream);
      });

      let dc = pc.createDataChannel('my_channel');
      console.log("Data channel created.");
      dc.addEventListener('message', (message) => {
        console.log("Data channel message received:", message.data);
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
      } catch (err) {
        console.error("Error during offer/answer exchange", err);
      }

      // Set up remote audio handling using the ontrack event.
      // Only set the remote stream once.
      pc.addEventListener("track", (event) => {
        console.log("Received remote track event:", event);
        if (!remoteStream.current) {
          remoteStream.current = event.streams[0];
          console.log("Remote stream set:", remoteStream.current);
        } else {
          console.log("Additional remote track received, ignoring duplicate.");
        }
      });

      setStatus("Peer connection created, audio tracks set up.");
    } catch (error: any) {
      console.error("Error initializing session:", error);
      Alert.alert("Error", error.message);
      setStatus("Error initializing session");
    }
  };

  const toggleAudio = () => {
    try {
      const audioTrack = localStream.current?.getAudioTracks()[0];
      if (audioTrack) {
        setIsMuted(!isMuted);
        audioTrack.enabled = isMuted;
        setStatus(isMuted ? 'Muted' : 'Unmuted');
        console.log(`Audio track ${isMuted ? 'disabled' : 'enabled'}.`);
      } else {
        console.warn('Audio track is undefined');
      }
    } catch (err) {
      console.error("Error toggling audio:", err);
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