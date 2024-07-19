import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {ButtonTemplate} from '../../components/index';
import {NotificationScreenProps} from '../../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function NotificationScreen({
  navigation,
}: NotificationScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.skipBtnContainer}
        onPress={() => navigation.navigate('MainApp', {screen: 'Dashboard'})}>
        <Text style={styles.skipBtn}>Skip</Text>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>Enable notification's</Text>
        <Text style={styles.description}>
          Get push-notification when you receive a message
        </Text>
      </View>
      <ButtonTemplate
        action={() => {}}
        stylebtn={'purple'}
        title="I want to be notified"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    flex: 1,
    alignItems: 'center',
  },
  textContainer: {
    height: screenHeight * 0.65,
    justifyContent: 'center',
    gap: 20,
  },
  icon: {
    fontSize: screenWidth * 0.3,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Montserrat',
    alignSelf: 'center',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 36,
  },
  description: {
    fontFamily: 'Montserrat',
    alignSelf: 'center',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
  },
  skipBtnContainer: {
    position: 'relative',
    top: 10,
    right: 15,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  skipBtn: {
    fontFamily: 'Montserrat',
    color: '#5271FF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
});
