import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Certificate } from '@/app/types/profile';
import CertificateItem from '@/components/CertificateItem';

interface CertificatesSectionProps {
  certificates: Certificate[];
  isLoadingCertificates: boolean;
  onViewCertificate: (certificate: Certificate) => void;
  onViewAll: () => void;
}

export default function CertificatesSection({
  certificates,
  isLoadingCertificates,
  onViewCertificate,
  onViewAll,
}: CertificatesSectionProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Feather name="award" size={20} color="#1fa2df" />
        <Text style={styles.infoLabel}>Certificados</Text>
      </View>

      <View style={styles.certificatesContainer}>
        {isLoadingCertificates ? (
          <ActivityIndicator size="small" color="#1fa2df" style={{ marginTop: 16 }} />
        ) : certificates && certificates.length > 0 ? (
          <View style={styles.certificatesList}>
            {certificates.map((certificate) => (
              <CertificateItem key={certificate.id} certificate={certificate} onPress={onViewCertificate} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum certificado disponível</Text>
          </View>
        )}

        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={styles.viewAllText}>Ver Todos os Certificados</Text>
          <Feather name="arrow-right" size={16} color="#1fa2df" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoItem: {
    gap: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#FFF',
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
    color: '#1fa2df',
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
    color: '#A8A8B3',
    fontSize: 14,
    textAlign: 'center',
  },
});
