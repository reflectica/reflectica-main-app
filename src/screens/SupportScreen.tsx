import React from 'react';
import {Text, StyleSheet, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ButtonTemplate} from '../components';

const screenHeight = Dimensions.get('window').height as number;
const screenWidth = Dimensions.get('window').width as number;

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Insights & Referrals</Text>
      {/* <View style={styles.body}></View> */}
      <ButtonTemplate
        title="Call our team"
        stylebtn={'purple'}
        action={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#F5F7FA',
    flex: 1,
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Montserrat',
    fontWeight: '700',
    fontSize: 25,
    lineHeight: 30.48,
    textAlign: 'center',
  },
  body: {
    backgroundColor: '#FFFFFF',
    width: screenWidth * 0.8,
    height: screenHeight * 0.7,
  },
});
