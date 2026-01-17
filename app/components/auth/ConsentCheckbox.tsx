import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConsentCheckboxProps {
  isChecked: boolean;
  onToggle: () => void;
  error?: string;
}

export default function ConsentCheckbox({ isChecked, onToggle, error }: ConsentCheckboxProps) {
  return (
    <View style={[styles.consentContainer, error && styles.consentContainerError]}>
      <TouchableOpacity style={styles.consentRow} onPress={onToggle} activeOpacity={0.7}>
        <View
          style={[styles.checkbox, isChecked && styles.checkboxChecked, error && !isChecked && styles.checkboxError]}
        >
          {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.consentText}>
          Estou a criar uma conta para um utilizador menor de 16 anos e confirmo que tenho autorização do responsável
          legal para o fazer.
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.consentErrorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  consentContainer: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginBottom: 16,
  },
  consentContainerError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#3D1E2A',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  checkboxError: {
    borderColor: '#FF6B6B',
  },
  consentText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'ManropeRegular',
  },
  consentErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 12,
    fontFamily: 'ManropeRegular',
  },
});
