import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSessionAndSurroundingScores } from '../hooks/useSessionAndSurroundingScores'; // Hook for data retrieval
import { useEmotionsAboveThreshold } from '../hooks/useEmotionsAboveThreshold'; // Hook for emotions retrieval
import FadedGraph from '../components/graph/FadedGraph'; // Line chart component
import BarGraph from '../components/graph/BarGraph'; // Bar chart component
import DonutChartComponent from '../components/graph/PieChartComponent'; // Donut chart component
import { useAllSummaryListener } from '../hooks/useSummaryListener'; // Hook to fetch session summaries
import { SessionBoxes } from '../components'; // Component to display each session
import { DashboardScreenProps } from '../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

// Utility function to calculate averages
const calculateAverage = (scores: (number | null)[]) => {
  const validScores = scores.filter(score => score !== null && !isNaN(score)) as number[];
  if (validScores.length === 0) return 0; // Return 0 if no valid scores
  const total = validScores.reduce((sum, score) => sum + score, 0);
  return total / validScores.length;
};

// Sanitize data to remove NaN values
const sanitizeData = (data: (number | null)[]): number[] => {
  return data.filter((value): value is number => value !== null && !isNaN(value));
};

// Function to get color with opacity
const getColorWithOpacity = (opacity: number) => `rgba(82, 113, 255, ${opacity})`;
const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { currentUser } = useAuth();

  // Use the hook to fetch last 30 days of scores
  const {
    loading,
    error,
    mentalHealthScores,
    phq9Scores, // 30-day PHQ-9 scores
    gad7Scores,
    cbtScores,
    psqiScores,
    pssScores,
    rosenbergScores,
    sfqScores,
    ssrsScores,
  } = useSessionAndSurroundingScores(currentUser?.uid || 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1', ''); // No sessionId needed here
  const { sessionSummary, loading: sessionsLoading, error: sessionsError } = useAllSummaryListener(
    currentUser?.uid || 'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1'
  );

  // Get the 3 most recent sessions
  const recentSessions = Array.isArray(sessionSummary)
    ? sessionSummary.slice(-3).reverse()
    : [];
  const totalSessions = Array.isArray(sessionSummary) ? sessionSummary.length : 0;

  // Fetch emotions with scores above 0.1 from the last 30 sessions
  const { emotionsAboveThreshold } = useEmotionsAboveThreshold('R5Jx5iGt0EXwOFiOoGS9IuaYiRu1');
  const validEmotions = emotionsAboveThreshold.filter(emotion => emotion.score !== null);
  const normalizeEmotions = (emotions: { label: string, score: number }[]) => {
    const totalScore = emotions.reduce((sum, emotion) => sum + emotion.score, 0);
    return emotions.map(emotion => ({
      label: emotion.label,
      percentage: Math.round((emotion.score / totalScore) * 100), // Normalize to percentage
    }));
  };


  // Calculate the averages for each DSM score
  const sanitizedPhq9Scores = sanitizeData(phq9Scores);
  const sanitizedGad7Scores = sanitizeData(gad7Scores);
  const sanitizedCbtScores = sanitizeData(cbtScores);
  const sanitizedPsqiScores = sanitizeData(psqiScores);
  const sanitizedPssScores = sanitizeData(pssScores);
  const sanitizedRosenbergScores = sanitizeData(rosenbergScores);
  const sanitizedSfqScores = sanitizeData(sfqScores);
  const sanitizedSsrsScores = sanitizeData(ssrsScores);
  const sanitizedMentalHealthScores = sanitizeData(mentalHealthScores);

  // Calculate the averages for each DSM score
  const averagePHQ9 = calculateAverage(sanitizedPhq9Scores);
  const averageGAD7 = calculateAverage(sanitizedGad7Scores);
  const averageCBT = calculateAverage(sanitizedCbtScores);
  const averagePSQI = calculateAverage(sanitizedPsqiScores);
  const averagePSS = calculateAverage(sanitizedPssScores);
  const averageRosenberg = calculateAverage(sanitizedRosenbergScores);
  const averageSFQ = calculateAverage(sanitizedSfqScores);
  const averageSSRS = calculateAverage(sanitizedSsrsScores);

  // Find top 3 emotions based on their average score
  const emotionAverages: { label: string, score: number }[] = [];
  const emotionMap: { [key: string]: number[] } = {};

  // Use 'validEmotions' instead of 'emotionsAboveThreshold'
  validEmotions.forEach((emotion) => {
    if (!emotionMap[emotion.label]) {
      emotionMap[emotion.label] = [];
    }
    if (emotion.score !== null) {
      emotionMap[emotion.label].push(emotion.score);
    }
  });
  

  Object.keys(emotionMap).forEach((label) => {
    const scores = emotionMap[label];
    const average = calculateAverage(scores);
    emotionAverages.push({ label, score: average });
  });

  // Sort emotions by score and take the top 3
  const topEmotions = emotionAverages.sort((a, b) => b.score - a.score).slice(0, 3);

  // Normalize top emotions for the pie chart
  const normalizedTopEmotions = normalizeEmotions(topEmotions);

  // Generate pie data for the chart component
  const pieData = normalizedTopEmotions.map((emotion, index) => ({
    label: emotion.label,
    percentage: emotion.percentage,
    color: getColorWithOpacity(1 - index * 0.3), // Fade color for each emotion
  }));

  const handleStartSessionPress = () => navigation.navigate('InSession');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dashboard</Text>

        {/* Top Section: Current Score and Line Chart 
        <View style={styles.topSection}>
          <View style={styles.scoreContainer}>
            <Text style={styles.boldText}>Current Score</Text>
            <Text style={styles.scoreValue}>
              {
                mentalHealthScores.length > 0 && mentalHealthScores[mentalHealthScores.length - 1] !== null
                  ? mentalHealthScores[mentalHealthScores.length - 1]!.toFixed(2)
                  : 'N/A'
              }
            </Text>
          </View>
          
          <View style={styles.lineChartContainer}>
            <Text style={styles.boldText}>Overall Mental Health</Text>
            <FadedGraph data={sanitizedMentalHealthScores} />
          </View>
        </View>
*/}
        {/* Start Session Button */}
        <View style={styles.sessionButtonWrapper}>
          <TouchableOpacity style={styles.sessionButton} onPress={handleStartSessionPress}>
            <Text style={styles.sessionButtonText}>Start a Session</Text>
          </TouchableOpacity>
        </View>

        {/* DSM Marker Scores Section */}
        <Text style={styles.sectionTitle}>Overall DSM Marker Scores This Month</Text>
        <View style={styles.section}>
          <BarGraph
            data={[
              { label: 'PHQ-9', value: averagePHQ9 },
              { label: 'GAD-7', value: averageGAD7 },
              { label: 'CBT', value: averageCBT },
              { label: 'PSQI', value: averagePSQI },
              { label: 'SFQ', value: averageSFQ },
              { label: 'PSS', value: averagePSS },
              { label: 'SSRS', value: averageSSRS },
            ]}
          />
        </View>

        {/* Emotional Model States Section */}
        <Text style={styles.sectionTitle}>Emotional State Modeling</Text>
        <View style={styles.pieChartContainer}>

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
        </View>
        <View style={styles.sessionCard}>
          <Text style={styles.exploreTitle}>Explore Recent Sessions</Text>
          {recentSessions.length > 0 ? (
            recentSessions.map((data, index) => {
              const sessionNumber = totalSessions - index;
              return (
                <TouchableOpacity
                  key={data.sessionId}
                  onPress={() => {
                    console.log('LOGGING SESSION ID:', data.sessionId);
                    navigation.navigate('SessionDetail', {
                      session: data,
                      sessionNumber: sessionNumber,
                    });
                  }}
                >
                  <SessionBoxes id={sessionNumber} description={data.shortSummary} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text>No recent sessions available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    paddingBottom: 15,
    lineHeight: 30.48,
    textAlign: 'center',
  },

  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  scoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '40%',
    alignItems: 'center',
    height: 150,
  },
  lineChartContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: screenWidth * 0.5, // Adjusted width
    alignItems: 'center',
    height: 150,
  },
  boldText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'black',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 40,
    paddingTop: 20,
    fontWeight: '700',
    color: 'black',
  },
  sessionButtonWrapper: {
    backgroundColor: '#4B7BEC',
    borderRadius: 15,
    paddingVertical: 25,
    width: '90%',
    height: 135,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  sessionButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 40,
    width: '60%',
    alignItems: 'center',

  },
  sessionButtonText: {
    color: '#4B7BEC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 13,
    marginTop: 10,
    width: '90%',
  },
  exploreTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 13,
    marginTop: 10,
    width: '90%',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    width: '90%',
    marginBottom: 12,
  },
  pieChartContainer: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 16,

    width: '90%',
  },
  pieChartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    width: '90%',
    marginBottom: 12,
  },
});

export default DashboardScreen;
