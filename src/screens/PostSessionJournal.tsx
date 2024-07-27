import React, {useState, useEffect} from 'react';
import {View, Text, SafeAreaView, StyleSheet, ScrollView} from 'react-native';
import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Mukta_400Regular,
  Mukta_700Bold,
} from '@expo-google-fonts/mukta';
import {
  DonutChartComponent,
  ReflecticaScoreIncrease,
  LineChartWithInteraction,
  BarGraph,
  SelfEsteemBarComponent,
} from '../components';
import {useRoute} from '@react-navigation/native'; // Import useRoute to get the passed parameters
import {useRecentMentalHealthScores} from '../hooks';

export default function PostSessionJournal() {
  const route = useRoute();
  const session = route.params?.session; // Get the session data from parameters

  const [fontsLoaded] = useFonts({
    Mukta_400Regular,
    Mukta_700Bold,
  });
  const [dsmScores, setDsmScores] = useState({});
  const [emotions, setEmotions] = useState([]);
  const [longSummary, setLongSummary] = useState('');
  const [lineData, setLineData] = useState([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]); // Initialize lineData with null values

  const {mentalHealthScores} = useRecentMentalHealthScores(
    'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1',
  ); // Use the hook to fetch recent scores

  useEffect(() => {
    if (session) {
      if (session.normalizedScores) {
        setDsmScores(session.normalizedScores);
        setLongSummary(session.longSummary); // Set longSummary from latestSession
      }

      if (session.emotions) {
        const filteredEmotions = session.emotions.filter(
          emotion => emotion.score > 0.1,
        );
        const normalizedEmotions = normalizeEmotions(filteredEmotions);
        setEmotions(normalizedEmotions);
      }
    }
  }, [session]);

  useEffect(() => {
    if (mentalHealthScores.length > 0) {
      const paddedScores = Array(7).fill(null);

      for (let i = 0; i < mentalHealthScores.length; i++) {
        paddedScores[i] = mentalHealthScores[i];
      }

      setLineData(paddedScores);
    }
  }, [mentalHealthScores]);

  const mentalHealthScore = session.mentalHealthScore;

  const calculateMentalHealthScore = scores => {
    const weights = {
      'PHQ-9 Score': 3,
      'GAD-7 Score': 3,
      'CBT Behavioral Activation': 2,
      'Rosenberg Self Esteem': 1,
      'PSQI Score': 2,
      'SFQ Score': 2,
      'PSS Score': 1,
      'SSRS Assessment': 1,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const key in scores) {
      if (scores[key] !== 'Not Applicable' && !isNaN(scores[key])) {
        totalWeightedScore += scores[key] * weights[key];
        totalWeight += weights[key];
      }
    }
    return 10 - totalWeightedScore / totalWeight;
  };

  const parseScores = dsmScore => {
    const lines = dsmScore.split('\n');
    const scores = {};

    lines.forEach(line => {
      const [key, value] = line.split(': ');
      scores[key.trim()] =
        value === 'Not Applicable'
          ? 'Not Applicable'
          : parseInt(value.trim(), 10);
    });

    return scores;
  };

  const normalizeScores = scores => {
    const ranges = {
      'PHQ-9 Score': [0, 27],
      'GAD-7 Score': [0, 21],
      'CBT Behavioral Activation': [0, 7],
      'Rosenberg Self Esteem': [10, 40],
      'PSQI Score': [0, 21],
      'SFQ Score': [0, 32],
      'PSS Score': [0, 40],
      'SSRS Assessment': [0, 5],
    };

    const normalizedScores = {};
    for (const key in scores) {
      if (scores[key] === 'Not Applicable') {
        normalizedScores[key] = 'Not Applicable';
      } else {
        const [min, max] = ranges[key];
        normalizedScores[key] = ((scores[key] - min) / (max - min)) * 10;
      }
    }

    return normalizedScores;
  };

  const normalizeEmotions = emotions => {
    const totalScore = emotions.reduce(
      (sum, emotion) => sum + emotion.score,
      0,
    );
    const sortedEmotions = emotions.sort((a, b) => b.score - a.score); // Sort emotions by score descending
    return sortedEmotions.map((emotion, index) => ({
      ...emotion,
      percentage: (emotion.score / totalScore) * 100,
      opacity: 1 - index * 0.1, // Decrement opacity by 0.1 for each subsequent emotion
    }));
  };

  const getColorWithOpacity = opacity => `rgba(82, 113, 255, ${opacity})`;

  const barData = [
    {
      label: 'PHQ-9',
      value: dsmScores['PHQ-9 Score'],
      color: '#5271FF',
      faded: dsmScores['PHQ-9 Score'] === 'Not Applicable',
    },
    {
      label: 'GAD-7',
      value: dsmScores['GAD-7 Score'],
      color: '#5271FF',
      faded: dsmScores['GAD-7 Score'] === 'Not Applicable',
    },
    {
      label: 'CBT',
      value: dsmScores['CBT Behavioral Activation'],
      color: '#5271FF',
      faded: dsmScores['CBT Behavioral Activation'] === 'Not Applicable',
    },
    {
      label: 'PSQI',
      value: dsmScores['PSQI Score'],
      color: '#5271FF',
      faded: dsmScores['PSQI Score'] === 'Not Applicable',
    },
    {
      label: 'SFQ',
      value: dsmScores['SFQ Score'],
      color: '#5271FF',
      faded: dsmScores['SFQ Score'] === 'Not Applicable',
    },
    {
      label: 'PSS',
      value: dsmScores['PSS Score'],
      color: '#5271FF',
      faded: dsmScores['PSS Score'] === 'Not Applicable',
    },
    {
      label: 'SSRS',
      value: dsmScores['SSRS Assessment'],
      color: '#5271FF',
      faded: dsmScores['SSRS Assessment'] === 'Not Applicable',
    },
  ];

  const pieData = emotions.map(emotion => ({
    label: emotion.label,
    percentage: Math.round(emotion.percentage),
    color: getColorWithOpacity(emotion.opacity),
  }));

  const lineLabels = ['S.1', 'S.2', 'S.3', 'S.4', 'S.5', 'S.6', 'S.7'];

  const selfEsteemScore =
    isNaN(dsmScores['Rosenberg Self Esteem']) ||
    dsmScores['Rosenberg Self Esteem'] === 'Not Applicable'
      ? null
      : dsmScores['Rosenberg Self Esteem'];

  // Ensure the selfEsteem section is faded based on the value
  const isScoreNull = selfEsteemScore === null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Session Summary</Text>
        <View style={styles.contentWrapper}>
          <Text style={styles.subheading}>Session #19</Text>
          <Text style={styles.score}>
            This Session's Score: {mentalHealthScore}/10
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Over Time</Text>
            <LineChartWithInteraction data={lineData} labels={lineLabels} />
          </View>

          <View style={styles.section}>
            <ReflecticaScoreIncrease
              scoreIncreasePercentage={20}
              message="Your Reflectica score increased 20% from last week, good job!"
            />
          </View>

          <View style={styles.barGraphSection}>
            <BarGraph data={barData} />
          </View>

          <View style={styles.selfEsteemSection}>
            <Text
              style={[styles.sectionTitle, isScoreNull && styles.fadedText]}>
              Rosenberg Self Esteem Bar
            </Text>
            <SelfEsteemBarComponent score={selfEsteemScore} />
          </View>

          <View style={styles.pieChartContainer}>
            <Text style={styles.sectionTitle}>Emotional State Modeling</Text>
            <View style={styles.pieChartWrapper}>
              <DonutChartComponent data={pieData} />
              <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                  <Text
                    key={index}
                    style={[styles.emotionalStateText, {color: item.color}]}>
                    {item.label} ({item.percentage}%)
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.keyTopicsSection}>
            <Text style={styles.sectionTitle}>Key Conversation Topics:</Text>
            <Text>{longSummary}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Set background color to gray to create border effect
  },
  scrollContainer: {
    paddingVertical: 30,
    alignItems: 'center', // Center the content horizontally
  },
  contentWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16, // Less sharp corners
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '90%', // Adjust the width to make the content narrower
    marginTop: 8, // Adjust margin to separate from heading
  },
  heading: {
    fontSize: 28, // Increase font size for the heading
    fontWeight: 'bold',
    marginBottom: 8, // Adjust margin for spacing
    textAlign: 'center',
    fontFamily: 'Mukta_700Bold',
  },
  subheading: {
    fontSize: 23, // Increase font size for the subheading
    fontWeight: '500',
    marginBottom: 8, // Adjust margin for spacing
    fontFamily: 'Mukta_400Regular',
  },
  score: {
    fontSize: 20, // Increase font size for the score
    marginBottom: 8, // Adjust margin for spacing
    fontFamily: 'Mukta_400Regular',
  },
  section: {
    marginBottom: 2, // Adjust margin between sections
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16, // Less sharp corners
  },
  barGraphSection: {
    marginBottom: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16, // Less sharp corners
  },
  selfEsteemSection: {
    marginBottom: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16, // Less sharp corners
  },
  pieChartContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16, // Less sharp corners
  },
  pieChartWrapper: {
    flexDirection: 'row', // Align pie chart and legend side by side
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between', // Space between pie chart and legend
  },
  lineChartWrapper: {
    height: 200,
    marginTop: 8, // Add margin to move the chart down
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Mukta_700Bold',
  },
  fadedText: {
    opacity: 0.5, // Adjust the opacity value to your preference
  },
  legendContainer: {
    alignItems: 'flex-start', // Align legend items to the left
    paddingLeft: 16, // Add padding to the left for spacing
    paddingBottom: 40,
  },
  legendItem: {
    flexDirection: 'row', // Align squares and text in a row
    alignItems: 'center', // Align items vertically in the center
    marginBottom: 8,
  },
  legendSquare: {
    width: 14,
    height: 14,
    marginRight: 8, // Space between square and text
  },
  emotionalStateText: {
    paddingTop: 8,
    paddingRight: 60,
    fontSize: 14,
    fontFamily: 'Mukta_400Regular',
  },
  keyTopicsSection: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16, // Less sharp corners
  },
  keyTopics: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Mukta_700Bold',
  },
});
