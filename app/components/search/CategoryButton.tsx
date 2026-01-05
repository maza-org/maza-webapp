import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryButtonProps } from '@/app/types/search';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CategoryButton({ icon, label, category, handlePressCategory }: CategoryButtonProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonText: {
      color: colors.text,
      fontSize: 14,
    },
  });

  return (
    <TouchableOpacity style={styles.categoryButton} onPress={() => handlePressCategory(category)}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
      <Text style={styles.categoryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}
