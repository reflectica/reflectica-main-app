import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';

interface ReflecticaScoreIncreaseProps {
  scoreIncreasePercentage: any;
  message: any;
}

const ReflecticaScoreIncrease = ({
  scoreIncreasePercentage,
  message,
}: ReflecticaScoreIncreaseProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <AnimatedCircularProgress
          size={50}
          width={5}
          fill={scoreIncreasePercentage}
          tintColor="#4caf50" // Green color for the fill
          backgroundColor="#e0e0e0"
          rotation={0}
          lineCap="round">
          {fill => (
            <View style={styles.svgContainer}>
              <Svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                // xmlns="http://www.w3.org/2000/svg"
              >
                <G clipPath="url(#clip0_3354_799)">
                  <Path
                    d="M4.24825 20C4.13454 19.5625 4.21458 19.0926 4.48181 18.7118L7.32947 14.6538L5.72294 12.4256C5.64501 12.3175 5.52556 12.2634 5.40611 12.2634C5.28665 12.2634 5.1672 12.3175 5.08923 12.4256L0.0744625 19.3809C-0.111827 19.6393 0.0728219 20 0.391338 20H4.24825Z"
                    fill="white"
                  />
                  <Path
                    d="M13.2706 8.29496V6.25H18.1534C18.3662 6.25 18.5623 6.13461 18.6656 5.94863C18.7689 5.76266 18.7633 5.5352 18.6509 5.35453L17.6283 3.71094L18.6509 2.06734C18.7634 1.88668 18.769 1.65926 18.6656 1.47324C18.5623 1.28723 18.3663 1.17188 18.1534 1.17188H13.2706V0.585938C13.2706 0.262344 13.0083 0 12.6847 0C12.3611 0 12.0988 0.262344 12.0988 0.585938V8.29496C12.4336 7.92727 12.928 7.91988 13.2706 8.29496Z"
                    fill="white"
                  />
                  <Path
                    d="M15.8967 13.6396L14.4979 14.9428C14.3854 15.0476 14.242 15.1 14.0985 15.1C13.955 15.1 13.8116 15.0476 13.6991 14.9428L12.6846 13.9976L11.6702 14.9427C11.4452 15.1524 11.0964 15.1524 10.8714 14.9427L9.47282 13.6396L5.44106 19.385C5.25942 19.6439 5.44457 20 5.76082 20H10.4208H19.6087C19.9249 20 20.1101 19.6439 19.9284 19.385L15.8967 13.6396Z"
                    fill="white"
                  />
                  <Path
                    d="M11.2708 13.7133L12.2851 12.7681C12.5101 12.5585 12.8589 12.5585 13.0839 12.7681L14.0985 13.7133L15.2271 12.6857L13.0044 9.5183C12.9267 9.40748 12.8057 9.35205 12.6847 9.35205C12.5637 9.35205 12.4427 9.40748 12.3649 9.5183L10.1422 12.6857L11.2708 13.7133Z"
                    fill="white"
                  />
                </G>
                <Defs>
                  <ClipPath id="clip0_3354_799">
                    <Rect width="20" height="20" fill="white" />
                  </ClipPath>
                </Defs>
              </Svg>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>
      <Svg height="40" width="10">
        <Rect x="4" y="0" width="2" height="40" fill="white" />
      </Svg>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#5271FF',
    padding: 10,
    borderRadius: 12, // Increase the border radius to make edges less sharp
    marginTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  circle: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -10}, {translateY: -10}],
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins', // Use Poppins font
    fontWeight: 400,
    // fontSize: '10px',
    flex: 1, // Ensure the text takes the remaining space
    flexWrap: 'wrap', // Wrap text to fit within the container
  },
});

export default ReflecticaScoreIncrease;
