import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import React from 'react';

interface ButtonProps {
  handle: () => void;
  text: string;
  disabled?: boolean;
  loading?: boolean;
}

function Button({ handle, text, disabled, loading }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.confirmButton, loading && styles.loadingButton, disabled && styles.disabledButton]}
      onPress={handle}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      <View style={styles.contentContainer}>
        {loading && <ActivityIndicator color="#FFFFFF" style={styles.spinner} />}
        <Text style={styles.confirmButtonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: '#22ACE3',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingButton: {
    backgroundColor: '#29292E',
  },
  disabledButton: {
    opacity: 0.7,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginRight: 8,
  },
});

export default Button;
