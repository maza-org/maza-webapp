import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { styles } from './styles';

export const ErrorState = memo(({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity
      style={styles.retryButton}
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Tentar carregar oportunidades novamente"
    >
      <Text style={styles.retryButtonText}>Tentar Novamente</Text>
    </TouchableOpacity>
  </View>
));

export const EmptyState = memo(() => (
  <View style={styles.centerContainer}>
    <Ionicons name="search-outline" size={64} color="#8F8F8F" />
    <Text style={styles.emptyText}>Nenhuma oportunidade encontrada</Text>
  </View>
));

export const LoadingState = memo(() => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#2EA8FF" />
    <Text style={styles.loadingText}>Carregando oportunidades...</Text>
  </View>
));
