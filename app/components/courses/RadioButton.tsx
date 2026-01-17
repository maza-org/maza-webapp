import React from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  animatedBg?: string;
  animatedText?: Animated.AnimatedInterpolation<string | number> | string;
}

export default function RadioButton({ label, selected, onPress, animatedBg, animatedText }: RadioButtonProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const selectedTextColor = isDark ? colors.text : '#FFFFFF';
  const unselectedTextColor = isDark ? colors.textMuted : colors.textSecondary;

  return (
    <Pressable
      style={[styles.radioButton, selected && animatedBg && { backgroundColor: animatedBg }]}
      onPress={onPress}
    >
      <Animated.Text
        style={[
          styles.radioButtonText,
          {
            color: animatedText as any || (selected ? selectedTextColor : unselectedTextColor),
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
    fontFamily: 'ManropeMedium',
  },
});
