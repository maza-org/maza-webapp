import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styles } from '@/app/styles/jobDetails.styles';

interface JobLoadingStateProps {
  message?: string;
}

export default function JobLoadingState({ message = 'Carregando detalhes da vaga...' }: JobLoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2EA8FF" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}
