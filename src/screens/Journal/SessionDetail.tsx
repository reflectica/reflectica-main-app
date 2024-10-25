// SessionDetail.tsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { SessionDetailScreenProps, SessionDetailProp } from '../../constants';
import {
  DonutChartComponent,
  ReflecticaScoreIncrease,
  LineChartWithInteraction,
  BarGraph,
  SelfEsteemBarComponent,
} from '../../components';
import { useSessionAndSurroundingScores } from '../../hooks';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const SessionDetail: React.FC<SessionDetailScreenProps> = ({ route }) => {
  const { session, sessionNumber } = route.params;
  const [sessionDetails, setSessionDetails] = useState<SessionDetailProp | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    mentalHealthScores,
    loading: hookLoading,
    error: hookError,
  } = useSessionAndSurroundingScores('R5Jx5iGt0EXwOFiOoGS9IuaYiRu1', session.sessionId);

  const [lineLabels, setLineLabels] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<Array<{ label: string; score: number; percentage?: number; opacity?: number }>>([]);

  useEffect(() => {
    setTimeout(() => {
      setSessionDetails(session);
      setLoading(false);
    }, 1000);
  }, [session]);

  // Update line labels based on mentalHealthScores
  useEffect(() => {
    if (mentalHealthScores.length > 0) {
      const newLineLabels = mentalHealthScores.map((_, index) => `S.${index + 1}`);
      setLineLabels(newLineLabels);
    }
  }, [mentalHealthScores]);

  useEffect(() => {
    if (session.emotions && Array.isArray(session.emotions)) {
      const filteredEmotions = session.emotions.filter((emotion: { score: number; }) => emotion.score > 0.10);
      const normalizedEmotions = normalizeEmotions(filteredEmotions);
      setEmotions(normalizedEmotions);
    } else {
      // Handle the case where emotions are 'unavailable'
      setEmotions([]); // Or handle it differently if you prefer
    }
  }, [session]);

  const normalizeEmotions = (
    emotions: Array<{ label: string; score: number }>
  ): Array<{ label: string; score: number; percentage: number; opacity: number }> => {
    const totalScore = emotions.reduce((sum, emotion) => sum + emotion.score, 0);
    const sortedEmotions = emotions.sort((a, b) => b.score - a.score);
    return sortedEmotions.map((emotion, index) => ({
      ...emotion,
      percentage: (emotion.score / totalScore) * 100,
      opacity: 1 - index * 0.1,
    }));
  };

  const getColorWithOpacity = (opacity: number) => `rgba(82, 113, 255, ${opacity})`;

  // Handle loading states from both component and hook
  if (loading || hookLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  // Handle errors from the hook
  if (hookError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to load session scores.</Text>
      </SafeAreaView>
    );
  }

  if (!sessionDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to load session details.</Text>
      </SafeAreaView>
    );
  }

  const barData = [
    {
      label: 'PHQ-9',
      value: typeof sessionDetails.normalizedScores?.['PHQ-9 Score'] === 'number' 
        ? sessionDetails.normalizedScores['PHQ-9 Score']
        : 0,  // Provide a fallback value like 0 if not applicable or undefined
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['PHQ-9 Score'] === 'Not Applicable',
    },
    {
      label: 'GAD-7',
      value: typeof sessionDetails.normalizedScores?.['GAD-7 Score'] === 'number'
        ? sessionDetails.normalizedScores['GAD-7 Score']
        : 0,
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['GAD-7 Score'] === 'Not Applicable',
    },
    {
      label: 'CBT',
      value: typeof sessionDetails.normalizedScores?.['CBT Behavioral Activation'] === 'number'
        ? sessionDetails.normalizedScores['CBT Behavioral Activation']
        : 0,
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['CBT Behavioral Activation'] === 'Not Applicable',
    },
    {
      label: 'PSQI',
      value: typeof sessionDetails.normalizedScores?.['PSQI Score'] === 'number'
        ? sessionDetails.normalizedScores['PSQI Score']
        : 0,
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['PSQI Score'] === 'Not Applicable',
    },
    {
      label: 'SFQ',
      value: typeof sessionDetails.normalizedScores?.['SFQ Score'] === 'number'
        ? sessionDetails.normalizedScores['SFQ Score']
        : 0,
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['SFQ Score'] === 'Not Applicable',
    },
    {
      label: 'PSS',
      value: typeof sessionDetails.normalizedScores?.['PSS Score'] === 'number'
        ? sessionDetails.normalizedScores['PSS Score']
        : 0,
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['PSS Score'] === 'Not Applicable',
    },
    {
      label: 'SSRS',
      value: typeof sessionDetails.normalizedScores?.['SSRS Assessment'] === 'number'
        ? sessionDetails.normalizedScores['SSRS Assessment']
        : 0,
      color: '#5271FF',
      faded: sessionDetails.normalizedScores?.['SSRS Assessment'] === 'Not Applicable',
    },
  ];
  

  const pieData = emotions.map((emotion) => ({
    label: emotion.label,
    percentage: Math.round(emotion.percentage || 0),
    color: getColorWithOpacity(emotion.opacity || 1),
  }));

  const selfEsteemScore = sessionDetails.normalizedScores?.['Rosenberg Self Esteem'] ?? null;
  const isScoreNull = selfEsteemScore === null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Session Summary</Text>
        <View style={styles.contentWrapper}>
          <Text style={styles.subheading}>Session #{sessionNumber}</Text>
          <Text style={styles.score}>This Session's Score: {session?.mentalHealthScore}/10</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Over Time</Text>
            {mentalHealthScores.length > 0 ? (
              <LineChartWithInteraction data={mentalHealthScores} labels={lineLabels} />
            ) : (
              <Text>No score data available.</Text>
            )}
          </View>

          <View style={styles.section}>
            <ReflecticaScoreIncrease scoreIncreasePercentage={20} message="Your Reflectica score increased 20% from last week, good job!" />
          </View>

          <View style={styles.barGraphSection}>
            <BarGraph data={barData} />
          </View>

          <View style={styles.selfEsteemSection}>
            <Text style={[styles.sectionTitle, isScoreNull && styles.fadedText]}>Rosenberg Self Esteem Bar</Text>
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
            <Text>{sessionDetails.longSummary}</Text>
          </View>
        </View>
      </ScrollView>
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SessionDetail;
