import React, { useState, useEffect } from 'react';
import {
  DonutChartComponent,
  ReflecticaScoreIncrease,
  LineChartWithInteraction,
  BarGraph,
  SelfEsteemBarComponent,
} from '../components';
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useRecentMentalHealthScores } from '../hooks';

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
  const route = useRoute<PostSessionJournalRouteProp>();
  const session = route.params?.session;

  const [dsmScores, setDsmScores] = useState<Record<string, any>>({});
  const [emotions, setEmotions] = useState<Array<{ label: string; score: number; percentage?: number; opacity?: number }>>([]);
  const [longSummary, setLongSummary] = useState<string>('');
  const [lineData, setLineData] = useState<number[]>([]);
  const [lineLabels, setLineLabels] = useState<string[]>([]);

  const { mentalHealthScores } = useRecentMentalHealthScores('R5Jx5iGt0EXwOFiOoGS9IuaYiRu1');

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
      setLineData(mentalHealthScores);
      setLineLabels(mentalHealthScores.map((_, index) => `S.${index + 1}`));
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
});

export default PostSessionJournal;
