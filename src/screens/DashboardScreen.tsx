import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import FadedGraph from '../components/graph/FadedGraph';
import BarGraph from '../components/graph/BarGraph';
import DonutChartComponent from '../components/graph/PieChartComponent';
import { useAppData } from '../hooks/useAppData';
import { SessionBoxes } from '../components';
import { DashboardScreenProps } from '../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { currentUser } = useAuth();

  const {
    loading,
    error,
    sessionSummary,
    recentSessionSummary,
    recentFeeling,
    mentalHealthScores,
    last30DaysScores,
    emotions,
    cbtScores,
    gad7Scores,
    phq9Scores,
    psqiScores,
    pssScores,
    rosenbergScores,
    sfqScores,
    ssrsScores,
  } = useAppData(currentUser?.uid || 'gADXwFiz2WfZaMgWLrffyr7Ookw2');

  const recentSessions = Array.isArray(recentSessionSummary)
    ? recentSessionSummary
    : [];

  const calculateAverage = (scores: (number | null)[]) => {
    const validScores = scores.filter(score => score !== null && !isNaN(score)) as number[];
    if (validScores.length === 0) return 0;
    const total = validScores.reduce((sum, score) => sum + score, 0);
    return total / validScores.length;
  };

  const sanitizeData = (data: (number | null)[]): number[] => {
    return data.filter((value): value is number => value !== null && !isNaN(value));
  };

  const getColorWithOpacity = (opacity: number) => `rgba(82, 113, 255, ${opacity})`;

  const totalSessions = Array.isArray(sessionSummary) ? sessionSummary.length : 0;
  
  const normalizeEmotions = (emotions: { label: string, score: number }[]) => {
    const totalScore = emotions.reduce((sum, emotion) => sum + emotion.score, 0);
    if (totalScore === 0) return [];
    return emotions.map(emotion => ({
      label: emotion.label,
      percentage: Math.round((emotion.score / totalScore) * 100),
    }));
  };

  const sanitizedPhq9Scores = sanitizeData(phq9Scores);
  const sanitizedGad7Scores = sanitizeData(gad7Scores);
  const sanitizedCbtScores = sanitizeData(cbtScores);
  const sanitizedPsqiScores = sanitizeData(psqiScores);
  const sanitizedPssScores = sanitizeData(pssScores);
  const sanitizedRosenbergScores = sanitizeData(rosenbergScores);
  const sanitizedSfqScores = sanitizeData(sfqScores);
  const sanitizedSsrsScores = sanitizeData(ssrsScores);
  const sanitizedMentalHealthScores = sanitizeData(mentalHealthScores);

  const averagePHQ9 = calculateAverage(sanitizedPhq9Scores);
  const averageGAD7 = calculateAverage(sanitizedGad7Scores);
  const averageCBT = calculateAverage(sanitizedCbtScores);
  const averagePSQI = calculateAverage(sanitizedPsqiScores);
  const averagePSS = calculateAverage(sanitizedPssScores);
  const averageRosenberg = calculateAverage(sanitizedRosenbergScores);
  const averageSFQ = calculateAverage(sanitizedSfqScores);
  const averageSSRS = calculateAverage(sanitizedSsrsScores);

  const filteredEmotions = emotions.filter(emotion => emotion.score > 0.1);
  const topEmotions = filteredEmotions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const normalizedTopEmotions = normalizeEmotions(topEmotions);

  const pieData = normalizedTopEmotions.map((emotion, index) => ({
    label: emotion.label,
    percentage: emotion.percentage,
    color: getColorWithOpacity(1 - index * 0.3),
  }));

  // Updated handlers with session type parameters
  const handleStartDiagnosticPress = () => {
    navigation.navigate('InSession', { sessionType: 'diagnostic' });
  };

  const handleStartTherapyPress = () => {
    navigation.navigate('InSession', { sessionType: 'guidedTherapy' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dashboard</Text>

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

        {/* Updated session button section with two buttons */}
        <View style={styles.sessionButtonWrapper}>
          <TouchableOpacity style={styles.sessionButton} onPress={handleStartDiagnosticPress}>
            <Text style={styles.sessionButtonText}>Start Diagnostic</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sessionTherapyButton} onPress={handleStartTherapyPress}>
            <Text style={styles.sessionTherapyButtonText}>Start Personalized Therapy</Text>
          </TouchableOpacity>
        </View>

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
              { label: 'Rosenberg', value: averageRosenberg },
              { label: 'SSRS', value: averageSSRS },
            ]}
          />
        </View>

        <Text style={styles.sectionTitle}>Emotional State Modeling</Text>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChartWrapper}>
            {pieData.length > 0 ? (
              <>
                <DonutChartComponent data={pieData} />
                <View style={styles.legendContainer}>
                  {pieData.map((item, index) => (
                    <Text key={index} style={[styles.emotionalStateText, { color: item.color }]}>
                      {item.label} ({item.percentage}%)
                    </Text>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No emotional data available</Text>
                <Text style={styles.noDataSubtext}>Complete a session to see your emotional patterns</Text>
              </View>
            )}
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
                  <SessionBoxes id={sessionNumber} description={data.description} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noSessionsContainer}>
              <Text style={styles.noSessionsText}>No recent sessions available</Text>
              <Text style={styles.noSessionsSubtext}>Start your first session to see your progress here!</Text>
            </View>
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
    width: screenWidth * 0.5,
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
    backgroundColor: '#5271FF',
    borderRadius: 15,
    paddingVertical: 25,
    width: '90%',
    height: 160, // Increased height to accommodate two buttons
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    gap: 12, // Space between buttons
  },
  sessionButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 15, // Slightly reduced padding to fit two buttons
    paddingHorizontal: 30,
    width: '75%', // Slightly wider to accommodate longer text
    alignItems: 'center',
  },
  sessionButtonText: {
    color: '#5271FF',
    fontSize: 16, // Slightly smaller font to fit longer text
    fontWeight: '700',
    textAlign: 'center',
  },
   sessionTherapyButton: {
    backgroundColor: '5271FF',
    borderRadius: 15,
    paddingVertical: 15, // Slightly reduced padding to fit two buttons
    paddingHorizontal: 30,
    width: '75%', // Slightly wider to accommodate longer text
    alignItems: 'center',
  },
  sessionTherapyButtonText: {
    color: '#fff',
    fontSize: 16, // Slightly smaller font to fit longer text
    fontWeight: '700',
    textAlign: 'center',
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
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    width: '90%',
    marginBottom: 12,
  },
  noSessionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noSessionsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  noSessionsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default DashboardScreen;