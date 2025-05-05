import {
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, memo } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Job } from '@/types/job';

// Constants
const API_ENDPOINT = 'https://www.emprego.co.mz/wp-api/vacancies/front';

// Custom hook for fetching jobs
function useJobsData() {
  const [state, setState] = useState<{
    jobs: Job[];
    isLoading: boolean;
    isRefreshing: boolean;
    error?: string;
  }>({
    jobs: [],
    isLoading: true,
    isRefreshing: false,
    error: undefined,
  });

  const fetchJobs = useCallback(async (isRefreshing = false) => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: !isRefreshing,
        isRefreshing,
        error: undefined,
      }));

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Handle different HTTP response status codes
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          jobs: data.results || [],
          isLoading: false,
          isRefreshing: false,
        }));
        return;
      }

      // Map status codes to user-friendly error messages
      const errorMessages: Record<number, string> = {
        400: 'Requisição inválida. Por favor, tente novamente.',
        401: 'Não autorizado. Por favor, faça login novamente.',
        403: 'Acesso proibido. Não tem permissão para ver estas oportunidades.',
        404: 'Recurso não encontrado. A API solicitada não existe.',
        429: 'Muitas requisições. Atingiu o limite de requisições permitidas.',
        500: 'Erro no servidor. Por favor, tente novamente mais tarde.',
        503: 'Serviço indisponível. O servidor está temporariamente fora do ar.',
      };

      const errorMessage = errorMessages[response.status] || `Erro desconhecido! Status: ${response.status}`;

      throw new Error(errorMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar as oportunidades. Tente novamente mais tarde.';

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isRefreshing: false,
      }));

      console.error('Error fetching jobs:', err);
    }
  }, []);

  const refreshJobs = useCallback(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    ...state,
    refreshJobs,
    fetchJobs,
  };
}

// Error state component
const ErrorState = memo(({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity
      style={styles.retryButton}
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Tentar carregar oportunidades novamente"
    >
      <Text style={styles.retryButtonText}>Tentar Novamente</Text>
    </TouchableOpacity>
  </View>
));

// Empty state component
const EmptyState = memo(() => (
  <View style={styles.centerContainer}>
    <Ionicons name="search-outline" size={64} color="#8F8F8F" />
    <Text style={styles.emptyText}>Nenhuma oportunidade encontrada</Text>
  </View>
));

// Loading state component
const LoadingState = memo(() => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#2EA8FF" />
    <Text style={styles.loadingText}>Carregando oportunidades...</Text>
  </View>
));

// Job badge component
interface BadgeProps {
  text: string;
  type: 'language' | 'new';
}

const Badge = memo(({ text, type }: BadgeProps) => (
  <View style={[styles.badge, type === 'new' ? styles.newBadge : styles.languageBadge]}>
    <Text style={[type === 'new' ? styles.newBadgeText : styles.languageBadgeText]} numberOfLines={1}>
      {text}
    </Text>
  </View>
));

// Job card meta item component
interface MetaItemProps {
  icon: string;
  text?: string;
}

const MetaItem = memo(({ icon, text }: MetaItemProps) => {
  if (!text) return null;

  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon as any} size={14} color="#8F8F8F" />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
});

// Company logo component
interface CompanyLogoProps {
  logo?: string;
  name?: string;
}

const CompanyLogo = memo(({ logo, name = '?' }: CompanyLogoProps) => (
  <View style={styles.companyLogoContainer}>
    {logo ? (
      <Image
        source={{ uri: logo }}
        style={styles.companyLogo}
        contentFit="contain"
        transition={300}
        accessibilityLabel={`Logo da ${name}`}
      />
    ) : (
      <View style={styles.placeholderLogo}>
        <Text style={styles.placeholderText}>{name.charAt(0)}</Text>
      </View>
    )}
  </View>
));

// Job card component
interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
}

const JobCard = memo(({ job, onPress }: JobCardProps) => {
  const handlePress = useCallback(() => {
    onPress(job);
  }, [job, onPress]);

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Vaga: ${job.title} em ${job.company?.name}`}
      accessibilityHint="Toque para ver detalhes da vaga"
    >
      <View style={styles.jobHeader}>
        <CompanyLogo logo={job.company?.logo} name={job.company?.name} />
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {job.company?.name}
          </Text>
          <View style={styles.jobMeta}>
            <MetaItem icon="location-outline" text={job.city?.name} />
            <MetaItem icon="briefcase-outline" text={job.category?.name} />
          </View>
        </View>
      </View>

      {job.meta?.language && <Badge type="language" text={job.meta.language.name} />}

      {job.meta?.new_post && <Badge type="new" text="Novo" />}
    </TouchableOpacity>
  );
});

export default function Opportunities() {
  const { jobs, isLoading, isRefreshing, error, fetchJobs, refreshJobs } = useJobsData();

  const navigateToJobDetail = useCallback((job: Job) => {
    router.push({
      pathname: '/jobs/[slug]',
      params: { slug: job.slug },
    });
  }, []);

  const renderJobItem = useCallback(
    ({ item }: { item: Job }) => <JobCard job={item} onPress={navigateToJobDetail} />,
    [navigateToJobDetail]
  );

  const keyExtractor = useCallback((item: Job) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Oportunidades</Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.jobList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshJobs}
                colors={['#2EA8FF']}
                tintColor="#2EA8FF"
              />
            }
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#8F8F8F',
    marginTop: 16,
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
  badge: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadge: {
    top: 12,
    right: 12,
    backgroundColor: '#3A3A3C',
  },
  languageBadgeText: {
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
  },
  newBadge: {
    bottom: 12,
    right: 12,
    backgroundColor: '#2EA8FF',
  },
  newBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});
