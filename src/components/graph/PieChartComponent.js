import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

const DonutChartComponent = ({ data, innerRadius = 45, outerRadius = 100, spacing = 5 }) => {
  const createDonutChart = (data) => {
    const total = data.reduce((sum, value) => sum + value.percentage, 0);
    let cumulative = 0;
    const center = { x: 100, y: 100 };

    return data.map((item, index) => {
      const startAngle = (cumulative / total) * 2 * Math.PI;
      cumulative += item.percentage;
      const endAngle = (cumulative / total) * 2 * Math.PI;

      const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

      const startOuterX = center.x + outerRadius * Math.cos(startAngle);
      const startOuterY = center.y + outerRadius * Math.sin(startAngle);
      const endOuterX = center.x + outerRadius * Math.cos(endAngle);
      const endOuterY = center.y + outerRadius * Math.sin(endAngle);

      const startInnerX = center.x + innerRadius * Math.cos(endAngle);
      const startInnerY = center.y + innerRadius * Math.sin(endAngle);
      const endInnerX = center.x + innerRadius * Math.cos(startAngle);
      const endInnerY = center.y + innerRadius * Math.sin(startAngle);

      const pathData = [
        `M ${startOuterX} ${startOuterY}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`,
        `L ${startInnerX} ${startInnerY}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}`,
        `L ${startOuterX} ${startOuterY}`,
        `M ${center.x} ${center.y}`
      ].join(' ');

      return <Path key={`pie-${index}`} d={pathData} fill={item.color} stroke="#fff" strokeWidth={spacing} />;
    });
  };

  return (
    <View style={styles.container}>
      <Svg height="150" width="150" viewBox="0 0 200 200">
        <G>{createDonutChart(data)}</G>
      </Svg>
      <View style={styles.labelsContainer}>
        {data.map((entry, index) => (
          <View key={index} style={styles.label}>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginBottom: 16,
    },
    labelsContainer: {
      flexDirection: 'column', // Changed from row to column
      alignItems: 'center', // Centered the labels
      marginTop: 16,
    },
    label: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2, // Adjusted margin for vertical spacing
    },
    colorIndicator: {
      width: 10,
      height: 10,
      marginRight: 4,
    },
    labelText: {
      fontSize: 12,
      fontFamily: 'Mukta_400Regular',
    },
  });

export default DonutChartComponent;