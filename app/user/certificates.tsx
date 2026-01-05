import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useUser from '@/hooks/useUser';
import { useCertificates } from '@/app/hooks/useCertificatesQueries';
import { Certificate } from '@/app/types/certificates';
import CertificatesHeader from '@/app/components/certificates/CertificatesHeader';
import LoadingState from '@/app/components/certificates/LoadingState';
import ErrorState from '@/app/components/certificates/ErrorState';
import EmptyState from '@/app/components/certificates/EmptyState';
import CertificatesList from '@/app/components/certificates/CertificatesList';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CertificatesScreen() {
  const { data: user } = useUser();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: certificatesData, isLoading, error, refetch, isRefetching } = useCertificates(user?.token);

  const certificates = certificatesData?.data || [];

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
  }), [colors]);

  const onRefresh = () => {
    refetch();
  };

  const viewCertificateDetails = (certificate: Certificate) => {
    router.push({
      pathname: '/user/certificate',
      params: {
        certificateId: certificate.documentId,
      },
    });
  };

  if (isLoading && !isRefetching) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <CertificatesHeader onBackPress={() => router.back()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <CertificatesHeader onBackPress={() => router.back()} />

      <ScrollView
        style={themedStyles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {error ? (
          <ErrorState
            error={error.message || 'Falha no carregamento de certificados. Tente novamente mais tarde.'}
            onRetry={() => refetch()}
          />
        ) : certificates.length === 0 ? (
          <EmptyState onExploreCourses={() => router.push('/')} />
        ) : (
          <CertificatesList certificates={certificates} onCertificatePress={viewCertificateDetails} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
