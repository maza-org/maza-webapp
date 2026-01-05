import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface EmptyStateProps {
  onExploreCourses: () => void;
}

export default function EmptyState({ onExploreCourses }: EmptyStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    emptyContainer: {
      flex: 1,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 500,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(31, 162, 223, 0.1)' : 'rgba(31, 162, 223, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    exploreCourseButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: 300,
      gap: 8,
    },
    exploreCourseButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Feather name="award" size={48} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum Certificado</Text>
      <Text style={styles.emptyText}>
        Você ainda não possui nenhum certificado. Complete cursos para ganhar certificados.
      </Text>
      <TouchableOpacity style={styles.exploreCourseButton} onPress={onExploreCourses}>
        <Feather name="book" size={20} color="#FFF" />
        <Text style={styles.exploreCourseButtonText}>Explorar Cursos</Text>
      </TouchableOpacity>
    </View>
  );
}
