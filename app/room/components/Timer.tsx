import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TimerProps {
  timeLeft: number;
  isWarning: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const Timer: React.FC<TimerProps> = ({ timeLeft, isWarning }) => {
  return (
    <View style={[styles.timerContainer, isWarning && styles.timerWarning]}>
      <Feather name="clock" size={16} color={isWarning ? '#FF3B30' : '#FFF'} />
      <Text style={[styles.timerText, isWarning && styles.timerTextWarning]}>{formatTime(timeLeft)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#323238',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  timerWarning: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  timerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  timerTextWarning: {
    color: '#FF3B30',
  },
});