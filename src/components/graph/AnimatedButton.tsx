import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

function getRandomValue() {
  return Math.random() * 0.4 + 0.8; // Random value between 0.8 and 1.2
}

interface AnimatedButtonProps {
  onRecordingToggle: (newRecordingState: boolean) => void;
  onSubmit: () => void;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onRecordingToggle, onSubmit }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const rotate = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const skewX = useSharedValue(0);
  const skewY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animateBubble = useCallback(() => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(360, { duration: 5000, easing: Easing.linear }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
    scaleX.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.ease }),
        withTiming(1, { duration: 2000, easing: Easing.ease }),
      ),
      -1,
      true,
    );
    scaleY.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 2000, easing: Easing.ease }),
      ),
      -1,
      true,
    );
    skewX.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 0.4 - 0.2, { duration: 1000, easing: Easing.ease }),
        withTiming(0, { duration: 1000, easing: Easing.ease }),
      ),
      -1,
      true,
    );
    skewY.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 0.4 - 0.2, { duration: 1000, easing: Easing.ease }),
        withTiming(0, { duration: 1000, easing: Easing.ease }),
      ),
      -1,
      true,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease }),
      ),
      -1,
      true,
    );
  }, [rotate, scaleX, scaleY, skewX, skewY, scale]);

  useEffect(() => {
    if (isRecording) {
      animateBubble();
    } else {
      rotate.value = withTiming(0, { duration: 500, easing: Easing.ease });
      scaleX.value = withTiming(1, { duration: 500, easing: Easing.ease });
      scaleY.value = withTiming(1, { duration: 500, easing: Easing.ease });
      skewX.value = withTiming(0, { duration: 500, easing: Easing.ease });
      skewY.value = withTiming(0, { duration: 500, easing: Easing.ease });
      scale.value = withTiming(1, { duration: 500, easing: Easing.ease });
    }
  }, [isRecording, animateBubble, rotate, scaleX, scaleY, skewX, skewY, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotate.value}deg` },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
        { skewX: `${skewX.value}rad` },
        { skewY: `${skewY.value}rad` },
        { scale: scale.value },
      ],
      opacity: 1,
    };
  });

  const toggleRecording = () => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    onRecordingToggle(newRecordingState);
    if (!newRecordingState) {
      onSubmit();
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleRecording}
      activeOpacity={1}
      style={styles.container}
    >
      <Animated.View style={[styles.circleContainer, animatedStyle]}>
        <Svg height="300" width="300" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient
              id="grad"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="35%" stopColor="black" stopOpacity="1" />
              <Stop offset="85%" stopColor="#1754CE" stopOpacity="1" />
              <Stop offset="90%" stopColor="#1754CE" stopOpacity="0.7" />
              <Stop offset="95%" stopColor="#1754CE" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#1754CE" stopOpacity="0.0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="40" fill="url(#grad)" />
        </Svg>
      </Animated.View>
      <Svg
        height="300"
        width="300"
        viewBox="0 0 100 100"
        style={styles.staticCircle}
      >
        <Defs>
          <RadialGradient
            id="gradStatic"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="35%" stopColor="black" stopOpacity="1" />
            <Stop offset="85%" stopColor="#1754CE" stopOpacity="1" />
            <Stop offset="90%" stopColor="#1754CE" stopOpacity="0.7" />
            <Stop offset="95%" stopColor="#1754CE" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#1754CE" stopOpacity="0.0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="40" fill="url(#gradStatic)" />
      </Svg>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staticCircle: {
    position: 'absolute',
  },
});

export default AnimatedButton;
