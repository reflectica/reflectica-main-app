import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BarGraph = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                { 
                  height: `${item.value * 10}%`, 
                  backgroundColor: item.color, 
                  opacity: item.faded ? 0.3 : 1  // Adjust opacity for faded bars
                }
              ]}
            />
          </View>
          <Text style={[styles.label, item.faded && { opacity: 0.3 }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 250, // Adjusted height to reduce gap
    paddingBottom: 20, // Added padding to balance the bar graph vertically
  },
  barContainer: {
    alignItems: 'center',
  },
  barBackground: {
    width: 15,
    height: 200, // Adjusted height of the bars
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginHorizontal: 5,
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default BarGraph;
