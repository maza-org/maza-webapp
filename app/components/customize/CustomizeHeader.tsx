import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomizeHeaderProps {
  showBackButton: boolean;
  onBackPress: () => void;
}

export default function CustomizeHeader({ showBackButton, onBackPress }: CustomizeHeaderProps) {
  if (!showBackButton) {
    return null;
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
});
