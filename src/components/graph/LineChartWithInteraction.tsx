import * as React from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, {
  Line,
  Circle,
  Text as SvgText,
  G,
  Path,
  Rect,
} from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

interface LineChartWithInteractionProps {
  data: (number | null)[];
  labels: string[];
}

const LineChartWithInteraction = ({
  data,
  labels,
}: LineChartWithInteractionProps) => {
  const maxValue = 10;
  const margin = 30; // Increased margin from 20 to 30 to provide extra whitespace
  const graphHeight = 200;
  const graphWidth = screenWidth - 100; // Adjusted to create space horizontally
  
  const [selectedPoint, setSelectedPoint] = React.useState<number | null>(null);

  const handleTouch = (evt: any) => {
    const touchX = evt.nativeEvent.locationX - margin;
    const index = Math.round(
      (touchX / (graphWidth - 2 * margin)) * (data.length - 1),
    );
    if (index >= 0 && index < data.length && data[index] !== null) {
      setSelectedPoint(index);
    } else {
      setSelectedPoint(null);
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouch,
      onPanResponderMove: handleTouch,
      onPanResponderRelease: () => setSelectedPoint(null),
      onPanResponderTerminate: () => setSelectedPoint(null),
    }),
  ).current;

  // Handle case when there's only one data point
  if (data.length === 1) {
    data = [data[0], data[0]]; // Duplicate the single point to avoid issues with line generation
  }

  // Generate points array with only valid data points
  const points = data
  .map((value: number | null, index: number) => {
    if (value !== null && !isNaN(value)) {
      const x =
        (index / (data.length - 1)) * (graphWidth - 2 * margin) + margin;
      const y = ((maxValue - value) / maxValue) * graphHeight + margin;
      return { x, y, value };
    }
    return null;
  })
  .filter((point) => point !== null) as { x: number; y: number; value: number }[];

  // Generate the path string for the line
  const linePath =
    points.length > 1
      ? points.reduce((acc: any, p: any, index: number) => {
          return acc + `${index === 0 ? 'M' : 'L'}${p.x},${p.y} `;
        }, '')
      : '';

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg height={graphHeight + 2 * margin} width={graphWidth}>
        <G>
          {labels.map((label: string, index: number) => {
            const x =
              (index / (labels.length - 1)) * (graphWidth - 2 * margin) +
              margin;

            // Only render if x is a valid number
            if (!isNaN(x)) {
              return (
                <G key={index}>
                  <Line
                    x1={x}
                    y1={margin}
                    x2={x}
                    y2={graphHeight + margin}
                    stroke="black"
                    strokeDasharray="4 4"
                  />
                  <SvgText
                    x={x}
                    y={graphHeight + 2 * margin - 4}
                    fontSize="12"
                    fill="black"
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            }
            return null;
          })}
          {linePath && (
            <Path d={linePath} fill="none" stroke="#5271FF" strokeWidth="2" />
          )}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgba(0, 0, 255, 0.5)"
            />
          ))}
          {selectedPoint !== null && points[selectedPoint] && (
            <G>
              <Circle
                cx={points[selectedPoint].x}
                cy={points[selectedPoint].y}
                r="6"
                fill="white"
                stroke="#5271FF"
                strokeWidth="2"
              />
              <Rect
                x={points[selectedPoint].x + 5}
                y={points[selectedPoint].y - 30}
                rx={5}
                ry={5}
                width="40"
                height="20"
                fill="#5271FF"
              />
              <SvgText
                x={points[selectedPoint].x + 25}
                y={points[selectedPoint].y - 15}
                fontSize="12"
                fill="white"
                textAnchor="middle"
              >
                {points[selectedPoint].value}
              </SvgText>
            </G>
          )}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Adjust padding to move the graph up and down
  },
});

export default LineChartWithInteraction;
