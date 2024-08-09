import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ImageSourcePropType
} from 'react-native';
import {ButtonTemplate, Pagination, CarouselComponent} from '../../components';
import { OnboardingScreenProps } from '../../constants';
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
    image: onboarding1,
    title: 'Hyper-Realistic',
    description:
      'Conduct audio therapy sessions with a hyper-realistic human sounding AI.',
  },
  {
    image: onboarding2,
    title: 'Artificial Intelligence',
    description: 'The most advanced non-clinical AI model for psychotherapy.',
  },
  {
    image: onboarding3,
    title: 'Advanced Insights',
    description:
      'Get a map of your mental health over time with data analytics.',
  },
];

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function OnboardingScreen({navigation}: OnboardingScreenProps) {
  const [activeSlide, setActiveSlide] = React.useState<number>(0);

  return (
    <SafeAreaView style={styles.container}>
      <CarouselComponent
        items={items}
        width={screenWidth}
        height={screenHeight * .65}
        renderItemContainerStyle={styles.slide}
        renderImageStyle={styles.images}
        loop={true}
        onSnapToItem={index => setActiveSlide(index)}
      />
      <View>
        <View style={styles.pagination}>
          <Text style={styles.title}>{items[activeSlide].title}</Text>
          <Text style={styles.description}>
            {items[activeSlide].description}
          </Text>
        </View>
        <Pagination length={items.length} activeIndex={activeSlide} />
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
    width: screenWidth * .85,
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
