import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryItemProps } from '@/app/types/categories';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CategoryItem({ category, onPress }: CategoryItemProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        categoryItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          marginBottom: 12,
        },
        iconContainer: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.buttonBackground,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        categoryInfo: {
          flex: 1,
        },
        categoryName: {
          fontSize: 16,
          fontWeight: '500',
          color: colors.text,
        },
        coursesCount: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 4,
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity style={themedStyles.categoryItem} onPress={() => onPress(category)}>
      <View style={themedStyles.iconContainer}>
        <Ionicons name={category.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={themedStyles.categoryInfo}>
        <Text style={themedStyles.categoryName}>{category.name}</Text>
        <Text style={themedStyles.coursesCount}>{category.courses} Cursos</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.iconColor} />
    </TouchableOpacity>
  );
}
