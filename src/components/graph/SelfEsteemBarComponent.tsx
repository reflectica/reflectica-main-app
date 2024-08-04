import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface SelfEsteemBarComponentProps {
  score: any;
}

const SelfEsteemBarComponent = ({score}: SelfEsteemBarComponentProps) => {
  const barFillStyle =
    score === null
      ? [styles.barFill, styles.barFaded]
      : [styles.barFill, {width: `${score * 10}%`}];

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={barFillStyle as ViewStyle[]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignItems: 'left', //this isn't allowed
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'CustomFont', // Ensure this matches the font family name
  },
  barBackground: {
    width: '90%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  barFaded: {
    width: '100%',
    backgroundColor: 'rgba(240, 240, 240, 0.1)', // Faded grey color
  },
});

export default SelfEsteemBarComponent;
