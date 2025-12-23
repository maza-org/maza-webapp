import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

export default function FormInput({
  label,
  error,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onPasswordToggle,
  style,
  ...props
}: FormInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, showPasswordToggle && styles.inputWithIcon, error && styles.inputError, style]}
          secureTextEntry={showPasswordToggle && !isPasswordVisible}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={onPasswordToggle} style={styles.passwordToggle}>
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});
