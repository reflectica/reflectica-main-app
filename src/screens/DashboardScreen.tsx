import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {selectUser} from '../features/auth/authSelectors.js'; // import the selector
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useRecentSummaryListener} from '../hooks/useSummaryListener.js';
import {useAuth} from '../context/AuthContext.js';
import {getEmojiByRating} from '../utils/emojiHelper.js';
import {NavigationProps} from '../constants';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({route, navigation}: NavigationProps) {
  const user = useSelector(selectUser);
  const {currentUser} = useAuth();

  const {recentSessionSummary, recentFeeling, loading, error} =
    useRecentSummaryListener('R5Jx5iGt0EXwOFiOoGS9IuaYiRu1' || currentUser.uid);

  console.log('session summary', recentSessionSummary);
  // console.log("USER ", currentUser.uid)

  const handleStartSessionPress = () => navigation.navigate('In-Session');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.firstRowContainer}>
        <View style={styles.lastFeelingBox}>
          <Text style={styles.boxTitle}>Last feeling...</Text>
          <Text style={{fontSize: 50, textAlign: 'center'}}>
            {getEmojiByRating(recentFeeling)}
          </Text>
          <Image
            style={styles.iIcon}
            source={require('../assets/dashboard/i.png')}
          />
        </View>
        <View style={styles.overallMentalHealthBox}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.boxTitle, {paddingRight: 5}]}>
              Overall Mental Health
            </Text>
            <Image
              style={styles.arrowupIcon}
              source={require('../assets/dashboard/arrowup.png')}
            />
          </View>
          <Image
            style={styles.iIcon}
            source={require('../assets/dashboard/i.png')}
          />
        </View>
      </View>
      <View style={startSession.container}>
        <TouchableOpacity
          style={startSession.button}
          onPress={handleStartSessionPress}>
          <Text style={startSession.text}>Start a session</Text>
        </TouchableOpacity>
      </View>
      <View style={recentJournal.container}>
        <Text style={styles.boxTitle}>Recent Session Journals</Text>
        {recentSessionSummary.map((data, index) => (
          <View key={data.sessionId} style={recentJournal.sessionCards}>
            <View style={recentJournal.checkmarkContainer}>
              <Image
                style={recentJournal.checkIcon}
                source={require('../assets/dashboard/check.png')}
              />
            </View>
            <Text style={recentJournal.titleDescription}>
              Session #{recentSessionSummary.length - index} |{' '}
              {data.shortSummary}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  title: {
    fontFamily: 'Montserrat',
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 30.48,
    textAlign: 'center',
  },
  boxTitle: {
    fontFamily: 'Mukta',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23.27,
    flexShrink: 1,
  },
  firstRowContainer: {
    flexDirection: 'row',
    width: screenWidth,
    padding: 0,
    height: screenHeight * 0.2,
    justifyContent: 'space-evenly',
  },
  lastFeelingBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screenWidth * 0.35,
    // height: screenHeight * .2,
    backgroundColor: 'white',
    borderRadius: 10,
    flexShrink: 1,
    padding: 10,
  },
  overallMentalHealthBox: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: screenWidth * 0.5,
    // height: screenHeight * .2,
    backgroundColor: 'white',
    borderRadius: 10,
    flexShrink: 1,
    padding: 10,
  },
  iIcon: {
    alignSelf: 'flex-start',
    height: 15,
    width: 15,
  },
  arrowupIcon: {
    width: 15,
    height: 15,
  },
});

const recentJournal = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: screenWidth * 0.9,
    alignSelf: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    padding: 10,
    borderRadius: 10,
    // justifyContent: 'space-between',
    gap: 10,
  },
  sessionCards: {
    backgroundColor: '#F5F7FA',
    height: 55,
    borderRadius: 5,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    flexShrink: 1,
  },
  checkmarkContainer: {
    backgroundColor: '#5271FF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    width: 22,
    marginRight: 10,
  },
  checkIcon: {
    height: 15,
    width: 15,
  },
  titleDescription: {
    fontFamily: 'Mukta',
    fontWeight: '500',
    lineHeight: 23.27,
    fontSize: 14,
    alignItems: 'center',
    flexShrink: 1,
  },
});

const startSession = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: '#5271FF',
    borderRadius: 10,
    width: screenWidth * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    height: screenHeight * 0.2,
    marginVertical: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 25,
  },
  text: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    color: '#5271FF',
  },
});
