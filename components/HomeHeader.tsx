import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HomeHeaderProps {
  onPress: () => void;
}

export default function HomeHeader({ onPress }: HomeHeaderProps) {
  return (
    <TouchableOpacity style={styles.header} onPress={onPress}>
      <Text style={styles.headerText}>O que pretende aprender hoje?</Text>
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
    color: '#FFF',
    width: 200,
  },
});
