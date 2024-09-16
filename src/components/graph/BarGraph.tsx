import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarGraphProps {
  data: { label: string; value: number; color?: string; faded?: boolean }[];
}

const BarGraph = ({ data }: BarGraphProps) => {
  // Log the data for debugging

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        // Ensure item.value is valid (not NaN or undefined)
        const barHeight = !isNaN(item.value) && item.value >= 0 ? item.value * 10 : 0;

        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${barHeight}%`,
                    backgroundColor: item.color || '#5271FF', // Default to blue if no color is provided
                    opacity: item.faded ? 0.3 : 1, // Adjust opacity for faded bars
                  },
                ]}
              />
            </View>
            <Text style={[styles.label, item.faded && { opacity: 0.3 }]}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 240,
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
  },
  barBackground: {
    width: 18,
    height: 190,
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
