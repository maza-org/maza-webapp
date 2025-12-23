import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryButtonProps } from '@/app/types/search';

export default function CategoryButton({ icon, label, category, handlePressCategory }: CategoryButtonProps) {
  return (
    <TouchableOpacity style={styles.categoryButton} onPress={() => handlePressCategory(category)}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color="#1fa2df" />
      <Text style={styles.categoryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202024',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
