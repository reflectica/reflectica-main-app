import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { MediaStream, RTCPeerConnection, mediaDevices } from 'react-native-webrtc';

const SessionScreenTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to connect');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
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
      console.log('Ephemeral token:', EPHEMERAL_KEY);
      
      // Create a new RTCPeerConnection
      const pc = new RTCPeerConnection();
      setPeerConnection(pc);

      // Set up remote audio handling using the ontrack event.
      // This will be triggered when a remote track is received.
      pc.ontrack = (event) => {
        console.log('Received remote track');
        // Assuming the first stream is the remote audio stream.
        remoteStream.current = event.streams[0];
      };

      // Get local audio (microphone) track.
      const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      
      // Add local audio track to the peer connection.
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      setStatus('Peer connection created, audio tracks set up.');
      // Continue with your offer/answer exchange etc.
    } catch (error: any) {
      console.error('Error initializing session:', error);
      Alert.alert('Error', error.message);
      setStatus('Error initializing session');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real-time AI Voice Chat</Text>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Start Session" onPress={init} />
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