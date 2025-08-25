import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type EnglishLevel = 'Basic' | 'Intermediate' | 'Advanced';

interface LevelBadgeProps {
  level?: EnglishLevel;
}

export function LevelBadge({ level = 'Basic' }: LevelBadgeProps) {
  // Translation mapping from English to Portuguese
  const levelTranslations: Record<EnglishLevel, string> = {
    Basic: 'Básico',
    Intermediate: 'Intermediário',
    Advanced: 'Avançado',
  };

  const levelColors: Record<EnglishLevel, string> = {
    Basic: '#4db5ff',
    Intermediate: '#ffa500',
    Advanced: '#ff4d4d',
  };

  const translatedLevel = levelTranslations[level];
  const dotColor = levelColors[level] || '#ffa500';

  return (
    <View style={styles.levelBadge}>
      <Text style={styles.levelText}>{translatedLevel}</Text>
      <View style={[styles.levelDot, { backgroundColor: dotColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: 50,
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#121214',
    marginRight: 8,
  },
  levelDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
  },
});
