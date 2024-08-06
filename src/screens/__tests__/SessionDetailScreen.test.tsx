import React from 'react';
import {render} from '@testing-library/react-native';
import {SessionDetail} from '../Journal';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../constants';

const mockNavigation: Partial<
  StackNavigationProp<RootStackParamList, 'SessionDetail'>
> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute: Partial<RouteProp<RootStackParamList, 'SessionDetail'>> = {
  params: {
    session: {moodPercentage: 75, longSummary: 'Sample summary'},
    sessionNumber: 1,
  },
};

test('renders SessionDetail with session data', () => {
  const {getByText} = render(
    <SessionDetail
      navigation={mockNavigation as any}
      route={mockRoute as any}
    />,
  );

  expect(getByText('Session Summary')).toBeTruthy();
  expect(getByText('Session #1')).toBeTruthy();
  expect(getByText('Reflectica Session Score:')).toBeTruthy();
  expect(getByText('75/100')).toBeTruthy();
  expect(getByText('Sample summary')).toBeTruthy();
});
