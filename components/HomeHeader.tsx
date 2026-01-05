import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface HomeHeaderProps {
  onPress: () => void;
}

export default function HomeHeader({ onPress }: HomeHeaderProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <TouchableOpacity style={styles.header} onPress={onPress}>
      <Text style={[styles.headerText, { color: colors.text }]}>O que pretende aprender hoje?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
    width: 200,
  },
});
