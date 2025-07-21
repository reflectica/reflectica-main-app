import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

// Example container to store transcript lines
type TranscriptItem = { speaker: 'user' | 'assistant'; text: string };

const BottomTranscript: React.FC<{ transcript: TranscriptItem[] }> = ({ transcript }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Button to show/hide the transcript */}
      <TouchableOpacity style={styles.tabButton} onPress={() => setVisible(true)}>
        <Text style={styles.tabButtonText}>Show Transcript</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Transcript</Text>
            <FlatList
              data={transcript}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.messageRow}>
                  <Text style={styles.speaker}>{item.speaker === 'user' ? 'You' : 'Therapist'}:</Text>
                  <Text style={styles.content}>{item.text}</Text>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#5271FF',
    borderRadius: 15,
  },
  tabButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: 'Montserrat'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '50%',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  speaker: {
    fontWeight: 'bold',
    marginRight: 6,
  },
  content: {
    flexShrink: 1,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#5271FF',
    borderRadius: 15,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default BottomTranscript;