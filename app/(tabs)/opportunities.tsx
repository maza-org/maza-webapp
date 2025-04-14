import { SafeAreaView, StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Job } from '@/types/job';

export default function Opportunities() {
  const [jobs, setJobs] = useState<Job[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(undefined);

      const endpoint = 'https://www.emprego.co.mz/wp-api/vacancies/front';

      const response = await fetch(endpoint, {
        method: 'GET',
      });

      // Handle different HTTP response status codes
      switch (response.status) {
        // Success responses
        case 200:
          const data = await response.json();
          setJobs(data.results);
          break;
        case 204:
          // No content
          setJobs([]);
          break;

        // Client errors
        case 400:
          throw new Error('Requisição inválida. Por favor, tente novamente.');
        case 401:
          throw new Error('Não autorizado. Por favor, faça login novamente.');
        case 403:
          throw new Error('Acesso proibido. Não tem permissão para ver estas oportunidades.');
        case 404:
          throw new Error('Recurso não encontrado. A API solicitada não existe.');
        case 429:
          throw new Error('Muitas requisições. Atingiu o limite de requisições permitidas.');
        // Server errors
        case 500:
          throw new Error('Erro no servidor. Por favor, tente novamente mais tarde.');
        case 503:
          throw new Error('Serviço indisponível. O servidor está temporariamente fora do ar.');

        // Other status codes
        default:
          throw new Error(`Erro desconhecido! Status: ${response.status}`);
      }

      setLoading(false);
    } catch (err) {
      // Handle the error message
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar as oportunidades. Tente novamente mais tarde.';
      setError(errorMessage);
      setLoading(false);
      console.error('Error fetching jobs:', err);
    }
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => {
        router.push({
          pathname: '/jobs/[id]',
          params: { slug: item.slug },
        });
      }}
    >
      <View style={styles.jobHeader}>
        <View style={styles.companyLogoContainer}>
          {item.company && item.company.logo ? (
            <Image source={{ uri: item.company.logo }} style={styles.companyLogo} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>{item.company?.name?.charAt(0) || '?'}</Text>
            </View>
          )}
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.companyName}>{item.company?.name}</Text>
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#8F8F8F" />
              <Text style={styles.metaText}>{item.city?.name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color="#8F8F8F" />
              <Text style={styles.metaText}>{item.category?.name}</Text>
            </View>
          </View>
        </View>
      </View>
      {item.meta?.language && (
        <View style={styles.languageBadge}>
          <Text style={styles.languageBadgeText}>{item.meta.language.name}</Text>
        </View>
      )}
      {item.meta?.new_post && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>Novo</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Oportunidades</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2EA8FF" />
            <Text style={styles.loadingText}>Carregando oportunidades...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#8F8F8F" />
            <Text style={styles.emptyText}>Nenhuma oportunidade encontrada</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.jobList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#121214',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8F8F8F',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#8F8F8F',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2EA8FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#8F8F8F',
    textAlign: 'center',
    marginTop: 16,
  },
  jobList: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  jobCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  jobHeader: {
    flexDirection: 'row',
  },
  companyLogoContainer: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#2EA8FF',
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8F8F8F',
    marginLeft: 4,
  },
  languageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#3A3A3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadgeText: {
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
  },
  newBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});
