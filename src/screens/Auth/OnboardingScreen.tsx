/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {ButtonTemplate} from '../../components';
import {OnboardingScreenProps} from '../../constants';
import onboarding1 from '../../assets/onboarding/onboarding1.jpg';
import onboarding2 from '../../assets/onboarding/onboarding2.jpg';
import onboarding3 from '../../assets/onboarding/onboarding3.jpg';

type ItemProps = {
  image: ImageSourcePropType;
  title: string;
  description: string;
};

const items: ItemProps[] = [
  {
    // image: require('../../assets/onboarding/Onboarding1.jpg'),
    image: onboarding1,
    title: 'Hyper-Realistic',
    description:
      'Conduct audio therapy sessions with a hyper-realistic human sounding AI.',
  },
  {
    // image: require('../../assets/onboarding/Onboarding2.jpg'),
    image: onboarding2,
    title: 'Artificial Intelligence',
    description: 'The most advanced non-clinical AI model for psychotherapy.',
  },
  {
    image: onboarding3,
    // image: require('../../assets/onboarding/Onboarding3.jpg'),
    title: 'Advanced Insights',
    description:
      'Get a map of your mental health over time with data analytics.',
  },
];

export default function OnboardingScreen({navigation}: OnboardingScreenProps) {
  const [activeSlide, setActiveSlide] = React.useState(0);
  // const navigation = useNavigation<OnboardingScreenProps>();
  console.log('OnboardingScreen Loaded');

  const renderItem = ({item}: {item: ItemProps}) => {
    return (
      // <View style={styles.slide}>
      //   <Image source={item.image} style={styles.images} />
      // </View>
      <View>
        <Image source={item.image} />
      </View>
    );
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      {/* <Carousel
        data={items}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={275}
        layout={'default'}
        inactiveSlideScale={0.8}
        inactiveSlideOpacity={0.6}
        activeSlideAlignment={'center'}
        loop={true}
        loopClonesPerSide={1}
        onSnapToItem={index => setActiveSlide(index)}
      /> */}
      <View>
        <View style={styles.pagination}>
          <Text style={styles.title}>{items[activeSlide].title}</Text>
          <Text style={styles.description}>
            {items[activeSlide].description}
          </Text>
        </View>
        <Pagination dotsLength={items.length} activeDotIndex={activeSlide} />
      </View>
      <ButtonTemplate
        title="Create an account"
        stylebtn="purple"
        action={() => {}}
      />
      <View style={styles.btnContainer}>
        <Text style={styles.login}>Already have an account?</Text>
        <Text
          style={styles.signin}
          onPress={() => navigation.navigate('Login')}>
          {' '}
          Sign In
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    gap: 5,
    marginBottom: 10,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  images: {
    width: '100%',
    height: 400,
    borderRadius: 15,
  },
  pagination: {alignItems: 'center', marginBottom: '5%', width: '80%'},
  title: {
    fontFamily: 'Montserrat',
    lineHeight: 36,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#5271FF',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Montserrat',
    lineHeight: 21,
    textAlign: 'center',
    fontSize: 14,
    color: '#323755',
    fontWeight: '400',
  },
  // createbtn: {
  //   backgroundColor: '#5271FF',
  //   width: '80%',
  //   borderRadius: 10,
  //   padding: 10,
  //   alignItems: 'center',
  //   marginTop: 20,
  // },
  btnContainer: {flexDirection: 'row', marginTop: '5%'},
  login: {
    color: '#000000',
    fontFamily: 'Montserrat',
    lineHeight: 21,
    fontSize: 14,
    fontWeight: '400',
  },
  signin: {
    fontFamily: 'Montserrat',
    color: '#5271FF',
    lineHeight: 21,
    fontSize: 14,
    fontWeight: '400',
  },
});
