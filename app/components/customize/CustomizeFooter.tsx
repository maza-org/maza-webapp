import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomizeFooterProps {
  selectedCount: number;
  onConfirm: () => void;
  onSkip: () => void;
}

export default function CustomizeFooter({ selectedCount, onConfirm, onSkip }: CustomizeFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.confirmButton, selectedCount === 0 && styles.confirmButtonDisabled]}
        disabled={selectedCount === 0}
        onPress={onConfirm}
      >
        <Text style={styles.confirmButtonText}>Confirmar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>Deixar para depois</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  confirmButton: {
    backgroundColor: '#22ACE3',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#29292E',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#A8A8B3',
    fontSize: 16,
  },
});