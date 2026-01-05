import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ErrorStateProps {
  onSkip: () => void;
}

export default function ErrorState({ onSkip }: ErrorStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
      textAlign: 'center',
      marginTop: 24,
      marginBottom: 12,
    },
    errorMessage: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    errorSkipButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 50,
    },
    errorSkipButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  }), [colors]);

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <View style={themedStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
        <Text style={themedStyles.errorTitle}>Não foi possível carregar os temas</Text>
        <Text style={themedStyles.errorMessage}>
          Ocorreu um erro ao carregar os temas disponíveis. Pode continuar sem personalizar a sua experiência.
        </Text>
        <TouchableOpacity style={themedStyles.errorSkipButton} onPress={onSkip}>
          <Text style={themedStyles.errorSkipButtonText}>Continuar para a aplicação</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
