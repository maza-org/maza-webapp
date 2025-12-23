import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface SearchLoadingProps {
  query: string;
  isLoading: boolean;
}

export function SearchLoading({ query, isLoading }: SearchLoadingProps) {
  if (!query || !isLoading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2EA8FF" />
    </View>
  );
}

interface SearchErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export function SearchError({ error, onRetry }: SearchErrorProps) {
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
  if (query) return null;

  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Digite acima para buscar oportunidades</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
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
    backgroundColor: '#2EA8FF',
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
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
  },
});
