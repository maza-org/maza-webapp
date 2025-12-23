import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJobSearch } from '@/hooks/useJobs';
import { Job } from '@/types/job';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SearchHeader from '@/app/components/jobs/SearchHeader';
import SearchInput from '@/app/components/jobs/SearchInput';
import SearchResults from '@/app/components/jobs/SearchResults';
import { SearchLoading, SearchError, SearchEmpty, SearchPlaceholder } from '@/app/components/jobs/SearchStates';

export default function Search() {
  const [query, setQuery] = useState('');
  const { data: searchResults = [], isLoading, error } = useJobSearch(query);

  const results = useMemo(() => {
    return searchResults.map((job: any) => ({
      ...job,
      is_from_anonymous_company: false,
    }));
  }, [searchResults]);

  const resultCount = useMemo(() => {
    return query.trim() ? results.length : null;
  }, [query, results.length]);

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <SearchHeader />

      <SearchInput value={query} onChangeText={setQuery} onClear={handleClearSearch} />

      <SearchLoading query={query} isLoading={isLoading} />

      <SearchError error={error} onRetry={() => setQuery(query)} />

      {query && resultCount === 0 && !isLoading && !error && <SearchEmpty query={query} />}

      {query && results.length > 0 && !isLoading && !error && (
        <SearchResults query={query} results={results} onJobPress={navigateToJobDetail} />
      )}

      <SearchPlaceholder query={query} />
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
});
