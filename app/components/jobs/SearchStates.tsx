import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

const useStyles = () => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return useMemo(() => StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    errorText: {
      color: '#FF5A5F',
      fontSize: 16,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.tint,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
    },
    placeholderContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
    },
  }), [colors]);
};

interface SearchLoadingProps {
  query: string;
  isLoading: boolean;
}

export function SearchLoading({ query, isLoading }: SearchLoadingProps) {
  const styles = useStyles();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  if (!query || !isLoading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  );
}

interface SearchErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export function SearchError({ error, onRetry }: SearchErrorProps) {
  const styles = useStyles();

  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {error instanceof Error ? error.message : 'Erro ao buscar oportunidades. Tente novamente.'}
      </Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

interface SearchEmptyProps {
  query: string;
}

export function SearchEmpty({ query }: SearchEmptyProps) {
  const styles = useStyles();

  if (!query) return null;

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma vaga encontrada para "{query}".</Text>
    </View>
  );
}

interface SearchPlaceholderProps {
  query: string;
}

export function SearchPlaceholder({ query }: SearchPlaceholderProps) {
  const styles = useStyles();

  if (query) return null;

  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Digite acima para buscar oportunidades</Text>
    </View>
  );
}
