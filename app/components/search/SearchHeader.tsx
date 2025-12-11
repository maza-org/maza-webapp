import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

interface SearchHeaderProps {
  onBackPress: () => void;
}

export default function SearchHeader({ onBackPress }: SearchHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>
      <Text style={styles.headerTitle}>Pesquisar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
    borderStyle: 'solid',
    borderColor: '#333',
    borderWidth: 0.5,
    padding: 8,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});