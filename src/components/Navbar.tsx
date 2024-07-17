import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

function Navbar({container}) {
  const [selected, setSelect] = useState();

  return (
    <View style={container}>
      <TouchableOpacity style={styles.cloudContainer}>
        <Image
          style={styles.imageSize}
          source={require('../assets/nav/cloud.png')}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image
          style={styles.imageSize}
          source={require('../assets/nav/log.png')}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image
          style={styles.imageSize}
          source={require('../assets/nav/question.png')}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image
          style={styles.imageSize}
          source={require('../assets/nav/setting.png')}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    bottom: -30,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight * 0.1,
    backgroundColor: 'white',
  },
  cloudContainer: {
    backgroundColor: 'linear-gradient(red, yellow)',
    borderRadius: 10,
  },
  imageSize: {
    height: 30,
    width: 30,
  },
});
