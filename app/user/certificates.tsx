import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import useUser from '@/hooks/useUser';
import CertificateItem from '@/components/CertificateItem';

export interface Certificate {
  id: number;
  documentId: string;
  createdAt: string;
  course: {
    id: number;
    documentId: string;
    title: string;
    author: string;
    rating_avg: number;
    subscribed: number;
  };
}

export default function CertificatesScreen() {
  const { data: user } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCertificates = async () => {
    if (!user?.token) {
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.mazas.org/api/certificates', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch certificates: ${response.status}`);
      }

      const result = await response.json();
      setCertificates(result.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to load certificates. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCertificates();
  };

  const viewCertificateDetails = (certificate: Certificate) => {
    router.push({
      pathname: '/user/certificate',
      params: {
        certificateId: certificate.documentId,
      },
    });
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Certificados</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1fa2df" />
          <Text style={styles.loadingText}>A carregar certificados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Certificados</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1fa2df" />}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Feather name="alert-circle" size={48} color="#1fa2df" />
            </View>
            <Text style={styles.errorTitle}>Erro</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCertificates}>
              <Feather name="refresh-cw" size={20} color="#FFF" style={styles.retryButtonIcon} />
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : certificates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="award" size={48} color="#1fa2df" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum Certificado</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui nenhum certificado. Complete cursos para ganhar certificados.
            </Text>
            <TouchableOpacity style={styles.exploreCourseButton} onPress={() => router.push('/')}>
              <Feather name="book" size={20} color="#FFF" />
              <Text style={styles.exploreCourseButtonText}>Explorar Cursos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.certificatesContainer}>
            {certificates.map((certificate) => (
              <CertificateItem key={certificate.id} certificate={certificate} onPress={viewCertificateDetails} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
    padding: 24,
    backgroundColor: '#202024',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#A8A8B3',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    gap: 8,
  },
  retryButtonIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exploreCourseButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    gap: 8,
  },
  exploreCourseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  certificatesContainer: {
    padding: 24,
    gap: 16,
  },
});
