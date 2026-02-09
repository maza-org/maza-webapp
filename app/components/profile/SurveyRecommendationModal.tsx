import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface SurveyRecommendationModalProps {
  visible: boolean;
  onClose: () => void;
  survey: string | null;
  isDark: boolean;
  colors: any;
}

export default function SurveyRecommendationModal({
  visible,
  onClose,
  survey,
  isDark,
  colors,
}: SurveyRecommendationModalProps) {
  const recommendation = useMemo(() => {
    return survey || null;
  }, [survey]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        container: {
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%',
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: 20,
          fontFamily: 'Manrope-Bold',
          color: colors.text,
          flex: 1,
        },
        closeButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        content: {
          paddingHorizontal: 24,
          paddingVertical: 24,
        },
        iconContainer: {
          alignItems: 'center',
          marginBottom: 16,
        },
        recommendationCard: {
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderRadius: 16,
          padding: 20,
        },
        recommendationText: {
          fontSize: 16,
          lineHeight: 26,
          fontFamily: 'Manrope-Regular',
          color: colors.text,
        },
        emptyState: {
          alignItems: 'center',
          paddingVertical: 40,
        },
        emptyText: {
          fontSize: 16,
          color: colors.textMuted,
          fontFamily: 'Manrope-Regular',
          textAlign: 'center',
          marginTop: 12,
        },
      }),
    [colors, isDark]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sua Recomendação</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {recommendation ? (
              <>
                <View style={styles.iconContainer}>
                  <Feather name="star" size={48} color={colors.primary} />
                </View>
                <View style={styles.recommendationCard}>
                  <Text selectable={true} style={styles.recommendationText}>
                    {recommendation}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>Nenhuma recomendação disponível</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
