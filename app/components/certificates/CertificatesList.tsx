import React from 'react';
import { View, StyleSheet } from 'react-native';
import CertificateItem from '@/components/CertificateItem';
import { Certificate } from '@/app/types/certificates';

interface CertificatesListProps {
  certificates: Certificate[];
  onCertificatePress: (certificate: Certificate) => void;
}

export default function CertificatesList({ certificates, onCertificatePress }: CertificatesListProps) {
  return (
    <View style={styles.certificatesContainer}>
      {certificates.map((certificate) => (
        <CertificateItem 
          key={certificate.id} 
          certificate={certificate} 
          onPress={onCertificatePress} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  certificatesContainer: {
    padding: 24,
    gap: 16,
  },
});