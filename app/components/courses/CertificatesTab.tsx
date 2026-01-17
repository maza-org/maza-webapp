import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Certificate } from '@/app/types/profile';
import { useCertificates } from '@/app/hooks/useProfileQueries';
import CertificateItem from '@/components/CertificateItem';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CertificatesTab() {
  const { data: certificates = [], isLoading, refetch } = useCertificates();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        },
        listContent: {
          padding: 16,
          gap: 12,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        },
        emptyIconContainer: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F0F0F5',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        },
        emptyTitle: {
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 8,
          textAlign: 'center',
          fontFamily: 'ManropeBold',
        },
        emptyText: {
          color: colors.textMuted,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20,
          fontFamily: 'ManropeRegular',
        },
        viewAllButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 16,
          marginBottom: 24,
          gap: 8,
          padding: 12,
        },
        viewAllText: {
          color: colors.primary,
          fontSize: 14,
          fontWeight: '500',
          fontFamily: 'ManropeMedium',
        },
      }),
    [colors, isDark]
  );

  const handleViewCertificate = (certificate: Certificate) => {
    router.push({
      pathname: '/user/certificate',
      params: { certificateId: certificate.documentId },
    });
  };

  const handleViewAll = () => {
    router.push('/user/certificates');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Feather name="award" size={32} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Nenhum certificado</Text>
        <Text style={styles.emptyText}>
          Complete cursos para ganhar certificados.{'\n'}
          Os seus certificados aparecerão aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CertificateItem certificate={item} onPress={handleViewCertificate} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
            <Text style={styles.viewAllText}>Ver Todos os Certificados</Text>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        }
      />
    </View>
  );
}
