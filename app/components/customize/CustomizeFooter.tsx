import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface CustomizeFooterProps {
  selectedCount: number;
  onConfirm: () => void;
  onSkip: () => void;
}

export default function CustomizeFooter({ selectedCount, onConfirm, onSkip }: CustomizeFooterProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.footerBackground,
    },
    confirmButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 50,
      alignItems: 'center',
      marginBottom: 12,
    },
    confirmButtonDisabled: {
      backgroundColor: colors.buttonBackground,
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
      color: colors.textMuted,
      fontSize: 16,
    },
  }), [colors]);

  return (
    <View style={themedStyles.footer}>
      <TouchableOpacity
        style={[themedStyles.confirmButton, selectedCount === 0 && themedStyles.confirmButtonDisabled]}
        disabled={selectedCount === 0}
        onPress={onConfirm}
      >
        <Text style={themedStyles.confirmButtonText}>Confirmar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={themedStyles.skipButton} onPress={onSkip}>
        <Text style={themedStyles.skipButtonText}>Deixar para depois</Text>
      </TouchableOpacity>
    </View>
  );
}
