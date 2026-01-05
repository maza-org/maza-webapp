import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Certificate } from '@/types/user';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface CertificateItemProps {
  certificate: Certificate;
  onPress: (certificate: Certificate) => void;
}

const CertificateItem: React.FC<CertificateItemProps> = ({ certificate, onPress }) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    certificateCard: {
      backgroundColor: colors.cardBackground,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    certificateIssuer: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    certificateDate: {
      color: colors.textMuted,
      fontSize: 12,
    },
  }), [colors]);

  return (
    <TouchableOpacity style={themedStyles.certificateCard} onPress={() => onPress(certificate)}>
      <View style={themedStyles.certificateIconContainer}>
        <Feather name="award" size={24} color={colors.primary} />
      </View>
      <View style={themedStyles.certificateInfo}>
        <Text style={themedStyles.certificateTitle}>{certificate.course.title}</Text>
        <Text style={themedStyles.certificateIssuer}>{certificate.course.author}</Text>
        <Text style={themedStyles.certificateDate}>{new Date(certificate.createdAt).toLocaleDateString('pt-PT')}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

export default CertificateItem;
