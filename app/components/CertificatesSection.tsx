import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CertificatesSectionProps } from '../types/profile';
import CertificateItem from './CertificateItem';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  certificates,
  isLoadingCertificates,
  onViewCertificate,
  onViewAll,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    infoItem: {
      gap: 12,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    certificatesContainer: {
      marginLeft: 28,
      marginTop: 8,
    },
    certificatesList: {
      gap: 12,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      gap: 8,
      padding: 8,
    },
    viewAllText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    emptyState: {
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      gap: 12,
    },
    emptyStateText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
    },
  }), [colors]);

  return (
    <View style={themedStyles.infoItem}>
      <View style={themedStyles.infoHeader}>
        <Feather name="award" size={20} color={colors.primary} />
        <Text style={themedStyles.infoLabel}>Certificados</Text>
      </View>

      <View style={themedStyles.certificatesContainer}>
        {isLoadingCertificates ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
        ) : certificates && certificates.length > 0 ? (
          <View style={themedStyles.certificatesList}>
            {certificates.map((certificate) => (
              <CertificateItem
                key={certificate.id}
                certificate={certificate}
                onPress={() => onViewCertificate(certificate)}
              />
            ))}
          </View>
        ) : (
          <View style={themedStyles.emptyState}>
            <Text style={themedStyles.emptyStateText}>Nenhum certificado disponível</Text>
          </View>
        )}

        <TouchableOpacity style={themedStyles.viewAllButton} onPress={onViewAll}>
          <Text style={themedStyles.viewAllText}>Ver Todos os Certificados</Text>
          <Feather name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
