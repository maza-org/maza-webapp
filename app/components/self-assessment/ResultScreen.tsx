import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';

interface ResultScreenProps {
  finalRecommendation: string;
  onComplete: () => void;
  isFromProfile: boolean;
  colors: any;
  isDark: boolean;
  headerTitleStyles: any;
  headerStyles: any;
}

export default function ResultScreen({
  finalRecommendation,
  onComplete,
  isFromProfile,
  colors,
  isDark,
  headerTitleStyles,
  headerStyles,
}: ResultScreenProps) {
  const resultStyles = useMemo(
    () =>
      StyleSheet.create({
        resultContainer: {
          flex: 1,
          paddingHorizontal: 24,
        },
        resultContent: {
          paddingVertical: 32,
        },
        resultIconContainer: {
          alignItems: 'center',
          marginBottom: 24,
        },
        resultTitle: {
          fontSize: 24,
          fontFamily: 'Manrope-Bold',
          textAlign: 'center',
          marginBottom: 24,
          color: colors.text,
        },
        resultCard: {
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderRadius: 20,
          padding: 24,
          marginBottom: 32,
        },
        resultLabel: {
          fontSize: 14,
          fontFamily: 'Manrope-Medium',
          color: colors.tint,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        resultText: {
          fontSize: 16,
          lineHeight: 26,
          fontFamily: 'Manrope-Regular',
          color: colors.text,
        },
        resultFooter: {
          paddingHorizontal: 24,
          paddingVertical: 24,
        },
      }),
    [colors, isDark]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={headerStyles}>
        <View style={{ width: 44 }} />
        <Text style={headerTitleStyles}>Recomendação</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={resultStyles.resultContainer} showsVerticalScrollIndicator={false}>
        <View style={resultStyles.resultContent}>
          <View style={resultStyles.resultIconContainer}>
            <Ionicons name="sparkles" size={64} color={colors.tint} />
          </View>

          <Text style={resultStyles.resultTitle}>Sua Orientação de Carreira</Text>

          <View style={resultStyles.resultCard}>
            <Text style={resultStyles.resultLabel}>Recomendação</Text>
            <Text style={resultStyles.resultText}>{finalRecommendation}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={resultStyles.resultFooter}>
        <Button handle={onComplete} text={isFromProfile ? 'Voltar ao Perfil' : 'Começar a Explorar'} />
      </View>
    </SafeAreaView>
  );
}
