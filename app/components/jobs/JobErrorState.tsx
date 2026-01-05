import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { createJobDetailsStyles } from '@/app/styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export default function JobErrorState({ error, onRetry }: JobErrorStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.reload();
    }
  };

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
