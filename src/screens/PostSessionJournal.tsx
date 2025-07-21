import React, { useState, useEffect } from 'react';
import {
  DonutChartComponent,
  ReflecticaScoreIncrease,
  LineChartWithInteraction,
  BarGraph,
  SelfEsteemBarComponent,
} from '../components';
import { Alert, Modal, TouchableOpacity, FlatList, View, Text, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../hooks/useAppData';

type SessionParams = {
  session: {
    sessionId?: string;
    normalizedScores?: Record<string, any>;
    emotions?: Array<{ label: string; score: number }>;
    longSummary?: string;
    mentalHealthScore?: number;
  };
};

type PostSessionJournalRouteProp = RouteProp<Record<string, SessionParams>, string>;

const PostSessionJournal: React.FC = () => {
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<PostSessionJournalRouteProp>();
  const session = route.params?.session;
  // Add these state variables
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const [dsmScores, setDsmScores] = useState<Record<string, any>>({});
  const [emotions, setEmotions] = useState<Array<{ label: string; score: number; percentage?: number; opacity?: number }>>([]);
  const [longSummary, setLongSummary] = useState<string>('');
  const [lineData, setLineData] = useState<number[]>([]);
  const [lineLabels, setLineLabels] = useState<string[]>([]);

  // CONDITIONAL hook usage - only fetch if we don't have session data
  const shouldFetchData = !session; // Only fetch if no session data from navigation
  const { 
    last30DaysScores: mentalHealthScores = [] 
  } = useAppData(shouldFetchData ? (currentUser?.uid || '') : '');

    // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlot = new Date(currentDate);
          timeSlot.setHours(hour, minute, 0, 0);
          
          const slotString = timeSlot.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          slots.push({
            id: timeSlot.toISOString(),
            display: slotString,
            date: timeSlot
          });
        }
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const toggleTimeSlot = (slotId: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleScheduleSubmit = () => {
    if (selectedTimeSlots.length < 5) {
      Alert.alert('Selection Required', 'Please select at least 5 time slots.');
      return;
    }
    
    // Here you would typically save the selected slots to your backend
    console.log('Selected time slots:', selectedTimeSlots);
    Alert.alert('Success', 'Your availability has been submitted!');
    setShowCalendar(false);
    setSelectedTimeSlots([]);
  };

  const handleReturnToDashboard = () => {
    navigation.navigate('Dashboard' as never);
  };

  useEffect(() => {
    if (session) {
      if (session.normalizedScores) {
        setDsmScores(session.normalizedScores);
        setLongSummary(session.longSummary || '');
      }

      // Check if emotions are available and are an array
      if (session.emotions && Array.isArray(session.emotions)) {
        const filteredEmotions = session.emotions.filter(emotion => emotion.score > 0.10);
        const normalizedEmotions = normalizeEmotions(filteredEmotions);
        setEmotions(normalizedEmotions);
      } else {
        // Handle the case where emotions are 'unavailable'
        setEmotions([]); // Or handle it differently if you prefer
      }
    }
  }, [session]);

  useEffect(() => {
    if (mentalHealthScores.length > 0) {
      const filteredScores = mentalHealthScores.filter((score): score is number => score !== null);
      setLineData(filteredScores);
      setLineLabels(filteredScores.map((_, index) => `S.${index + 1}`));
    }
  }, [mentalHealthScores]);

  const normalizeEmotions = (emotions: Array<{ label: string; score: number }>) => {
    const totalScore = emotions.reduce((sum, emotion) => sum + emotion.score, 0);
    const sortedEmotions = emotions.sort((a, b) => b.score - a.score);
    return sortedEmotions.map((emotion, index) => ({
      ...emotion,
      percentage: (emotion.score / totalScore) * 100,
      opacity: 1 - (index * 0.1),
    }));
  };
  const getColorWithOpacity = (opacity: number) => `rgba(82, 113, 255, ${opacity})`;

  const pieData = emotions.map(emotion => ({
    label: emotion.label,
    percentage: Math.round(emotion.percentage || 0),
    color: getColorWithOpacity(emotion.opacity || 1),
  }));

  const barData = [
    { label: 'PHQ-9', value: dsmScores['PHQ-9 Score'], color: '#5271FF', faded: dsmScores['PHQ-9 Score'] === 'Not Applicable' },
    { label: 'GAD-7', value: dsmScores['GAD-7 Score'], color: '#5271FF', faded: dsmScores['GAD-7 Score'] === 'Not Applicable' },
    { label: 'CBT', value: dsmScores['CBT Behavioral Activation'], color: '#5271FF', faded: dsmScores['CBT Behavioral Activation'] === 'Not Applicable' },
    { label: 'PSQI', value: dsmScores['PSQI Score'], color: '#5271FF', faded: dsmScores['PSQI Score'] === 'Not Applicable' },
    { label: 'SFQ', value: dsmScores['SFQ Score'], color: '#5271FF', faded: dsmScores['SFQ Score'] === 'Not Applicable' },
    { label: 'PSS', value: dsmScores['PSS Score'], color: '#5271FF', faded: dsmScores['PSS Score'] === 'Not Applicable' },
    { label: 'SSRS', value: dsmScores['SSRS Assessment'], color: '#5271FF', faded: dsmScores['SSRS Assessment'] === 'Not Applicable' },
  ];

  const selfEsteemScore = isNaN(dsmScores['Rosenberg Self Esteem']) || dsmScores['Rosenberg Self Esteem'] === 'Not Applicable' ? null : dsmScores['Rosenberg Self Esteem'];

  const isScoreNull = selfEsteemScore === null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Session Summary</Text>
        <View style={styles.contentWrapper}>
          <Text style={styles.subheading}>Session #19</Text>
          <Text style={styles.score}>This Session's Score: {session?.mentalHealthScore}/10</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Over Time</Text>
            <LineChartWithInteraction data={lineData} labels={lineLabels} />
          </View>

          <View style={styles.section}>
            <ReflecticaScoreIncrease scoreIncreasePercentage={20} message="Your Reflectica score increased 20% from last week, good job!" />
          </View>

          <View style={styles.barGraphSection}>
            <BarGraph data={barData} />
          </View>

          <View style={styles.selfEsteemSection}>
            <Text style={[styles.sectionTitle, isScoreNull && styles.fadedText]}>
              Rosenberg Self Esteem Bar
            </Text>
            <SelfEsteemBarComponent score={selfEsteemScore} />
          </View>

          <View style={styles.pieChartContainer}>
            <Text style={styles.sectionTitle}>Emotional State Modeling</Text>
            {emotions.length > 0 ? (
              <View style={styles.pieChartWrapper}>
                <DonutChartComponent data={pieData} />
                <View style={styles.legendContainer}>
                  {pieData.map((item, index) => (
                    <Text key={index} style={[styles.emotionalStateText, { color: item.color }]}>
                      {item.label} ({item.percentage}%)
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              <Text>Emotions data is unavailable for this session.</Text>
            )}
          </View>
          <View style={styles.keyTopicsSection}>
            <Text style={styles.sectionTitle}>Key Conversation Topics:</Text>
            <Text>{longSummary}</Text>
          </View>

          {/* Next Steps Action Card */}
          <View style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Next Steps</Text>
            <Text style={styles.actionCardSubtitle}>Continue your mental health journey</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.actionButtonText}>Schedule Tele-Health Meeting</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleReturnToDashboard}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Available Time Slots</Text>
              <Text style={styles.modalSubtitle}>
                Please select at least 5 time slots that work for you
              </Text>
              <Text style={styles.selectedCount}>
                Selected: {selectedTimeSlots.length} slots
              </Text>
            </View>
            
            <FlatList
              data={timeSlots}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeSlot,
                    selectedTimeSlots.includes(item.id) && styles.selectedTimeSlot
                  ]}
                  onPress={() => toggleTimeSlot(item.id)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTimeSlots.includes(item.id) && styles.selectedTimeSlotText
                  ]}>
                    {item.display}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.timeSlotList}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  selectedTimeSlots.length < 5 && styles.disabledButton
                ]}
                onPress={handleScheduleSubmit}
                disabled={selectedTimeSlots.length < 5}
              >
                <Text style={styles.submitButtonText}>Submit Availability</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  contentWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '90%',
    marginTop: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 23,
    fontWeight: '500',
    marginBottom: 8,
  },
  score: {
    fontSize: 20,
    marginBottom: 8,
  },
  section: {
    marginBottom: 2,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  barGraphSection: {
    marginBottom: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  selfEsteemSection: {
    marginBottom: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  pieChartContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  pieChartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fadedText: {
    opacity: 0.5,
  },
  legendContainer: {
    alignItems: 'flex-start',
    paddingLeft: 16,
    paddingBottom: 40,
  },
  emotionalStateText: {
    paddingTop: 8,
    paddingRight: 60,
    fontSize: 14,
  },
  keyTopicsSection: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#5271FF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#5271FF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#5271FF',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: '#5271FF',
    fontWeight: '600',
  },
  timeSlotList: {
    maxHeight: 300,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    backgroundColor: '#5271FF',
    borderColor: '#5271FF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#5271FF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostSessionJournal;