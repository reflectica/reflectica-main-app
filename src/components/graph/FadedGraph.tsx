import React from 'react';
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
          labels: [], // No labels needed
          datasets: [
            {
              data: data,
              strokeWidth: 2,
              color: () => `#5271FF`, // Blue line color in full opacity
            },
          ],
        }}
        width={Dimensions.get('window').width * 0.5} // Adjusted width to fit container
        height={80} // Increased height for better vertical space
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: () => `#5271FF`, // Line color in chartConfig
          fillShadowGradient: '#5271FF', // Fill starts with #5271FF
          fillShadowGradientOpacity: 0.3, // Opacity for gradient fill
          style: {
            borderRadius: 8,
          },
          propsForBackgroundLines: {
            strokeWidth: 0, // Remove background grid lines
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
          paddingRight: 1, // Removes right padding for a more compact chart
        }}
        fromZero={true} // Ensures y-axis starts at zero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30, // Increased padding for better fit
  },
});

export default FadedGraph;
