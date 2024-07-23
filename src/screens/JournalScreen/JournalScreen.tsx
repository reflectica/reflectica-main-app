import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SessionBoxes} from '../../components';
import {useAllSummaryListener} from '../../hooks/useSummaryListener';
import {JournalScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
// const screenWidth = Dimensions.get('window').width;

export default function JournalScreen({navigation}: JournalScreenProps) {
  const {sessionSummary, loading, error} = useAllSummaryListener(
    'R5Jx5iGt0EXwOFiOoGS9IuaYiRu1',
  );

  // console.log('error', error)
  console.log('sessionSummary', sessionSummary);

  return (
    <SafeAreaView style={styles.container}>
      {/* <MainTemplate title="Session Journals"/> */}
      <Text style={styles.title}>Session Journals</Text>
      <View style={styles.body}>
        {Array.isArray(sessionSummary) &&
          sessionSummary.map((data, index) => (
            <TouchableOpacity
              // index={index}
              onPress={() => {
                console.log('LOGGING SESSION ID:', data.sessionId);
                navigation.navigate('SessionDetail', {
                  session: data,
                  sessionNumber: index + 1,
                });
              }}>
              <SessionBoxes id={index + 1} description={data.shortSummary} />
            </TouchableOpacity>
          ))}

        {/* {error && <Text>Error: {error}</Text>}
        // {loading && <Text>Loading: {loading}</Text>} */}
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
    width: '80%',
    height: screenHeight * 0.7,
    borderRadius: 10,
    paddingTop: 10,
  },
});
