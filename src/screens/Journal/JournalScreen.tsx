import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
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
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the SafeAreaView takes up the full screen
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 10, // Optional: Adds padding to prevent content from touching the edges
  },
  title: {
    fontSize: 25,
    lineHeight: 30.48,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginVertical: 10,
    paddingBottom: 15,
  },
  body: {
    backgroundColor: 'white',
    width: '90%',
    flex: 1, // Allows the body to expand and fill available space
    borderRadius: 15,
    paddingTop: 25,
    paddingHorizontal: 15, // Optional: Adds horizontal padding for better layout
  },
  scrollContainer: {
    paddingBottom: 20, // Adds padding to the bottom for better scrolling experience
  },
});
