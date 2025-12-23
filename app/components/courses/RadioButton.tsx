import React from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  animatedBg?: string;
  animatedText?: string;
}

export default function RadioButton({ label, selected, onPress, animatedBg, animatedText }: RadioButtonProps) {
  return (
    <Pressable
      style={[styles.radioButton, selected && animatedBg && { backgroundColor: animatedBg }]}
      onPress={onPress}
    >
      <Animated.Text
        style={[
          styles.radioButtonText,
          {
            color: animatedText || (selected ? '#fff' : '#666'),
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radioButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    zIndex: 1,
    height: 42,
    justifyContent: 'center',
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
