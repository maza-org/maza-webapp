import { useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useJobSearch } from '@/hooks/useJobs';
import { Job } from '@/types/job';
import { JobCard } from '@/components/opportunities/JobCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Search() {
  const [query, setQuery] = useState('');
  const { data: searchResults = [], isLoading, error } = useJobSearch(query);

  const handleBackPress = () => {
    router.back();
  };

  const results = useMemo(() => {
    return searchResults.map((job: any) => ({
      ...job,
      is_from_anonymous_company: false,
    }));
  }, [searchResults]);

  const resultCount = useMemo(() => {
    return query.trim() ? results.length : null;
  }, [query, results.length]);

  const handleInputChange = (text: string) => {
    setQuery(text);
  };

  const handleClearSearch = () => {
    setQuery('');
  };

  const navigateToJobDetail = useCallback((job: Job) => {
    router.push({
      pathname: '/jobs/[slug]',
      params: { slug: job.slug },
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Pesquisar Oportunidades</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Digite o termo da vaga..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={handleInputChange}
          autoFocus
        />
        {query ? (
          <Pressable onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </Pressable>
        ) : (
          <Ionicons name="search" size={20} color="#666" />
        )}
      </View>

      {query && resultCount !== null && (
        <Text style={styles.resultCount}>
          {resultCount} Resultados para "{query}"
        </Text>
      )}

      {query && isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EA8FF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Erro ao buscar oportunidades. Tente novamente.'}
          </Text>
          <TouchableOpacity onPress={() => setQuery(query)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : query && resultCount === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma vaga encontrada para "{query}".</Text>
        </View>
      ) : query && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <JobCard job={item} onPress={navigateToJobDetail} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : !query ? (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Digite acima para buscar oportunidades</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 25,
    paddingStart: 25,
    paddingEnd: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
    borderStyle: 'solid',
    borderColor: '#333',
    borderWidth: 0.5,
    padding: 8,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    backgroundColor: '#202024',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  resultCount: {
    fontSize: 16,
    color: '#8F8F8F',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    color: '#FF5A5F',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2EA8FF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});
