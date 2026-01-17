import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'Nenhum curso encontrado',
  message = 'Não encontramos cursos para esta categoria. Tente procurar por outro termo ou categoria.',
}: EmptyStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 60,
        },
        title: {
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
          textAlign: 'center',
          fontFamily: 'ManropeBold',
        },
        message: {
          color: colors.textSecondary,
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 24,
          maxWidth: 280,
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors]
  );

  return (
    <View style={themedStyles.container}>
      <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
      <Text style={themedStyles.title}>{title}</Text>
      <Text style={themedStyles.message}>{message}</Text>
    </View>
  );
}
