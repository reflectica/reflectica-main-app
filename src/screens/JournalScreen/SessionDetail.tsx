import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {SessionDetailScreenProps} from '../../constants';
import {Error} from '../../components';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function SessionDetail({
  navigation,
  route,
}: SessionDetailScreenProps) {
  const {session, sessionNumber} = route.params;
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch session details using sessionId
    // Simulate fetching data with a timeout
    setTimeout(() => {
      setSessionDetails({id: session.sessionId, details: session.session});
      setLoading(false);
    }, 1000);
  }, [session]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return <Error error={error} />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Session Summary</Text>
      <View style={styles.body}>
        <Text style={styles.session}>Session #{sessionNumber}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>Reflectica Session Score: </Text>
          <Text>{session.moodPercentage}/100</Text>
        </View>
        <Text style={styles.dataMarkers}>Clincally Relevant Data Markers:</Text>
        <Text style={styles.keyTopics}>Key Conversation Topics: </Text>
        <Text style={styles.keyBullets}>{session.longSummary}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    gap: 15,
    flex: 1,
  },
  title: {
    fontSize: 25,
    lineHeight: 30.48,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  body: {
    backgroundColor: 'white',
    gap: 5,
    width: '80%',
    height: screenHeight * 0.7,
    borderRadius: 10,
    paddingTop: 10,
    padding: screenWidth * 0.04,
  },
  session: {
    fontWeight: '700',
    fontFamily: 'Mukta',
    fontSize: 21,
    lineHeight: 34.9,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontWeight: '700',
    fontFamily: 'Mukta',
    fontSize: 18,
    lineHeight: 29.92,
  },
  moodPercentage: {
    fontWeight: '500',
    fontFamily: 'Mukta',
    fontSize: 18,
    lineHeight: 29.92,
  },
  dataMarkers: {
    fontWeight: '700',
    fontFamily: 'Mukta',
    fontSize: 18,
    lineHeight: 29.92,
  },
  keyTopics: {
    fontWeight: '700',
    fontFamily: 'Mukta',
    fontSize: 18,
    lineHeight: 29.92,
  },
  keyBullets: {
    fontWeight: '500',
    fontFamily: 'Mukta',
    fontSize: 18,
    lineHeight: 29.92,
  },
});
