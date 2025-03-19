import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Certificate } from '@/types/user';

interface CertificateItemProps {
  certificate: Certificate;
  onPress: (certificate: Certificate) => void;
}

const CertificateItem: React.FC<CertificateItemProps> = ({ certificate, onPress }) => {
  return (
    <TouchableOpacity style={styles.certificateCard} onPress={() => onPress(certificate)}>
      <View style={styles.certificateIconContainer}>
        <Feather name="award" size={24} color="#1fa2df" />
      </View>
      <View style={styles.certificateInfo}>
        <Text style={styles.certificateTitle}>{certificate.course.title}</Text>
        <Text style={styles.certificateIssuer}>{certificate.course.author}</Text>
        <Text style={styles.certificateDate}>{new Date(certificate.createdAt).toLocaleDateString('pt-PT')}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#A8A8B3" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  certificateCard: {
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 162, 223, 0.1)',
  },
  certificateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  certificateIssuer: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  certificateDate: {
    color: '#A8A8B3',
    fontSize: 12,
  },
});

export default CertificateItem;
