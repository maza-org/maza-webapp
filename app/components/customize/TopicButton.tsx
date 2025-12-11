import React from 'react';
import { Text, TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';

interface TopicButtonProps extends TouchableOpacityProps {
  topic: string;
  isSelected: boolean;
}

export default function TopicButton({ topic, isSelected, onPress, ...props }: TopicButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.topicButton, isSelected && styles.topicButtonSelected]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>{topic}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#202024',
    borderWidth: 1,
    borderColor: '#323238',
  },
  topicButtonSelected: {
    backgroundColor: '#323238',
    borderColor: '#22ACE3',
  },
  topicText: {
    color: '#A8A8B3',
    fontSize: 14,
  },
  topicTextSelected: {
    color: '#FFFFFF',
  },
});