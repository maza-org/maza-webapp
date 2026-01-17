import React, { useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface TopicButtonProps extends TouchableOpacityProps {
  topic: string;
  isSelected: boolean;
}

export default function TopicButton({ topic, isSelected, onPress, ...props }: TopicButtonProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    topicButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topicButtonSelected: {
      backgroundColor: isDark ? '#323238' : '#E3F2FD',
      borderColor: colors.primary,
    },
    topicText: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'Manrope-Regular',
    },
    topicTextSelected: {
      color: colors.text,
    },
  }), [colors, isDark]);

  return (
    <TouchableOpacity
      style={[themedStyles.topicButton, isSelected && themedStyles.topicButtonSelected]}
      onPress={onPress}
      {...props}
    >
      <Text style={[themedStyles.topicText, isSelected && themedStyles.topicTextSelected]}>{topic}</Text>
    </TouchableOpacity>
  );
}
