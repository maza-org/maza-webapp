import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createJobDetailsStyles } from '@/app/styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobLoadingStateProps {
  message?: string;
}

export default function JobLoadingState({ message = 'Carregando detalhes da vaga...' }: JobLoadingStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}
