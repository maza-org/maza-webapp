import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  title?: string;
  message?: string;
}

export default function LoadingState({ title = 'Carregando categorias...', message }: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8257e5" />
      <Text style={styles.loadingText}>{title}</Text>
      {message && <Text style={styles.loadingMessage}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingMessage: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
