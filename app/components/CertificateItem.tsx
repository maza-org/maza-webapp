import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Certificate } from '../types/profile';

interface CertificateItemProps {
  certificate: Certificate;
  onPress: (certificate: Certificate) => void;
}

const CertificateItem: React.FC<CertificateItemProps> = ({ certificate, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(certificate)}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="award" size={20} color="#1fa2df" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{certificate.course?.title}</Text>
          <Text style={styles.author}>{certificate.course?.author}</Text>
          <Text style={styles.date}>{new Date(certificate.createdAt).toLocaleDateString('pt-PT')}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#A8A8B3" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  author: {
    color: '#A8A8B3',
    fontSize: 14,
    fontFamily: 'ManropeRegular',
  },
  date: {
    color: '#A8A8B3',
    fontSize: 12,
    fontFamily: 'ManropeRegular',
  },
});

export default CertificateItem;
