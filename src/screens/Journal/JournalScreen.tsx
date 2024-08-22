import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView, // Import ScrollView
} from 'react-native';
import { SessionBoxes } from '../../components';
import { useAllSummaryListener } from '../../hooks/useSummaryListener';
import { JournalScreenProps } from '../../constants';

export default function JournalScreen({ navigation }: JournalScreenProps) {
  const { sessionSummary, loading, error } = useAllSummaryListener(
    'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1'
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Session Journals</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.body}>
          {Array.isArray(sessionSummary) &&
            sessionSummary.map((data, index) => (
              <TouchableOpacity
                key={index} // Add key prop for performance
                onPress={() => {
                  console.log('LOGGING SESSION ID:', data.sessionId);
                  navigation.navigate('SessionDetail', {
                    session: data,
                    sessionNumber: index + 1,
                  });
                }}
              >
                <SessionBoxes id={index + 1} description={data.shortSummary} />
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 25,
    lineHeight: 30.48,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginVertical: 10,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Add some padding to the bottom for better scrolling experience
  },
  body: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    paddingTop: 10,
  },
});
