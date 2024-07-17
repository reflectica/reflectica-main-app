import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';

interface MainTemplateProps {
    title: string;
}
export default function MainTemplate({title}: MainTemplateProps) {
  return (
    <View style={{marginBottom: 20}}>
      <Text style={{fontSize: 24, fontWeight: 'bold'}}>{title}</Text>
    </View>
  );
}
