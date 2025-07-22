import React from 'react';
import {StyleSheet, Dimensions, Text, TouchableOpacity} from 'react-native';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface ButtonTemplateProps {
  title: string;
  stylebtn: string;
  action: () => void;
  styling?: Object;
  disabled?: boolean;
}
export default function ButtonTemplate({
  title,
  stylebtn,
  action,
  styling,
  disabled = false,
}: ButtonTemplateProps) {
  return (
    <TouchableOpacity
      style={[
        stylebtn === 'purple' ? purpleBtn.btn : clearBtn.btn, 
        styling,
        disabled && styles.disabledBtn
      ]}
      onPress={disabled ? undefined : action}
      disabled={disabled}>
      <Text style={[
        stylebtn == 'purple' ? purpleBtn.text : clearBtn.text,
        disabled && styles.disabledText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const purpleBtn = StyleSheet.create({
  btn: {
    backgroundColor: '#5271FF',
    width: screenWidth * 0.8,
    height: screenHeight * 0.06,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    lineHeight: 24,
    fontFamily: 'Montserrat',
  },
});

const clearBtn = StyleSheet.create({
  btn: {
    borderColor: '#5271FF',
    height: screenHeight * 0.06,
    width: screenWidth * 0.8,
    borderRadius: 15,
    borderWidth: 1,
    // padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5271FF',
    lineHeight: 24,
    fontFamily: 'Montserrat',
  },
});

const styles = StyleSheet.create({
  disabledBtn: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
  },
  disabledText: {
    color: '#666666',
  },
});
