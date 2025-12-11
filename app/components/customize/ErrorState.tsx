import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ErrorStateProps {
  onSkip: () => void;
}

export default function ErrorState({ onSkip }: ErrorStateProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#A8A8B3" />
        <Text style={styles.errorTitle}>Não foi possível carregar os temas</Text>
        <Text style={styles.errorMessage}>
          Ocorreu um erro ao carregar os temas disponíveis. Pode continuar sem personalizar a sua experiência.
        </Text>
        <TouchableOpacity style={styles.errorSkipButton} onPress={onSkip}>
          <Text style={styles.errorSkipButtonText}>Continuar para a aplicação</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#A8A8B3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorSkipButton: {
    backgroundColor: '#1fa2df',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
  },
  errorSkipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});