import React from 'react';
import {StyleSheet, Text, View, Dimensions, Image} from 'react-native';

// const screenHeight = Dimensions.get('window').height;
// const screenWidth = Dimensions.get('window').width;
interface SessionBoxesProps {
  id: number;
  description: string;
}

export default function SessionBoxes({id, description}: SessionBoxesProps) {
  return (
    <View style={sessionStyles.sessionCards} key={id}>
      <View style={sessionStyles.checkmarkContainer}>
        <Image
          style={sessionStyles.checkIcon}
          source={require('../assets/dashboard/check.png')}
        />
      </View>
      <Text style={sessionStyles.titleDescription}>
        {' '}
        Session #{id} | {description}
      </Text>
    </View>
  );
}

const sessionStyles = StyleSheet.create({
  // container: {
  //     width:screenWidth * .8,
  //     height: screenHeight * .29,
  //     backgroundColor:'white',
  //     borderRadius:10,
  //     padding:15,
  //     margin:5,
  // },
  sessionCards: {
    margin: 7,
    backgroundColor: '#F5F7FA',
    height: 55,
    borderRadius: 5,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 20,
  },
  checkmarkContainer: {
    backgroundColor: '#5271FF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    width: 22,
  },
  checkIcon: {
    height: 15,
    width: 15,
  },
  titleDescription: {
    fontFamily: 'Mukta',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23.27,
    alignItems: 'center',
    flexShrink: 1,
  },
});
