import React, { useEffect } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, View, StyleSheet } from 'react-native';

interface FadedGraphProps {
  data: number[]; // Expecting an array of numbers for the data
}

const FadedGraph: React.FC<FadedGraphProps> = ({ data }) => {

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={{
          labels: [],
          datasets: [
            {
              data: data,
              strokeWidth: 2,
              color: (opacity = 1) => `rgba(75, 123, 236, ${opacity})`,

            },
          ],
        }}
        width={Dimensions.get('window').width * 0.5} // Adjusted width to fill container
        height={80} // Increased height for more vertical space
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(75, 123, 236, ${opacity})`,
          style: {
            borderRadius: 8,
          },
        }}
        bezier
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels={false}
        withHorizontalLabels={false}
        style={{
          borderRadius: 8,
          paddingRight: 1, // Removes right padding to make chart more compact
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30, // Increased padding to fit the chart better
  },
});

export default FadedGraph;
