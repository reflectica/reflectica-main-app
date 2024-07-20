import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, StyleSheet} from 'react-native';

interface ErrorProps {
  error: string;
}
export default function Error({error}: ErrorProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Error: {error}</Text>
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
});
