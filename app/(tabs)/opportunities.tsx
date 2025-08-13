import {
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Platform,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Job } from '@/types/job';
import { useJobsData } from '@/hooks/useJobsData';
import { ErrorState, EmptyState } from '@/components/opportunities/StateComponents';
import { JobCard } from '@/components/opportunities/JobCard';
import { FlashList } from '@shopify/flash-list';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { JobCardSkeleton } from '@/components/opportunities/JobCardSkeleton';
import { Ionicons } from '@expo/vector-icons';
import Shimmer from '@/components/Shimmer';

const SKELETON_COUNT = 6;

const TitleSkeleton = () => <View testID="title-skeleton" style={styles.titleSkeleton} />;

const SearchBar = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.searchContainer}>
    <TouchableOpacity style={styles.searchBar} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar oportunidades..."
        placeholderTextColor="#888"
        onFocus={onPress}
        editable={false}
      />
    </TouchableOpacity>
  </View>
);

const SearchBarSkeleton = () => (
  <View style={styles.searchContainer}>
    <Shimmer style={styles.searchBar}>
      <View style={{ height: 24, borderRadius: 8 }} />
    </Shimmer>
  </View>
);

export default function Opportunities() {
  const { jobs, isLoading, isRefreshing, error, fetchJobs, refreshJobs } = useJobsData();
  const [isErrorBoundary, setIsErrorBoundary] = useState(false);

  const handleSearchPress = useCallback(() => {
    router.push('/jobs/search');
  }, []);

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

  const renderSkeleton = useCallback(() => {
    return Array(SKELETON_COUNT)
      .fill(0)
      .map((_, index) => <JobCardSkeleton key={`skeleton-${index}`} />);
  }, []);

  const keyExtractor = useCallback((item: Job) => item.id.toString(), []);

  const ListComponent = useMemo(() => {
    return Platform.OS === 'ios' ? FlashList : FlatList;
  }, []);

  const getItemType = useCallback((item: Job) => {
    return 'job';
  }, []);

  const estimatedItemSize = useMemo(() => 120, []);

  const handleError = useCallback(() => {
    setIsErrorBoundary(true);
  }, []);

  if (isErrorBoundary) {
    return (
      <ErrorState
        message="Ocorreu um erro inesperado. Por favor, tente novamente."
        onRetry={() => {
          setIsErrorBoundary(false);
          fetchJobs();
        }}
      />
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.header}>
          {isLoading ? <TitleSkeleton /> : <Text style={styles.title}>Oportunidades</Text>}
        </View>

        {isLoading ? <SearchBarSkeleton /> : <SearchBar onPress={handleSearchPress} />}

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.skeletonContainer}>{renderSkeleton()}</View>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchJobs} />
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <ListComponent
              testID="job-list"
              data={jobs}
              renderItem={renderJobItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.jobList}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={estimatedItemSize}
              getItemType={getItemType}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={8}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refreshJobs}
                  colors={['#2EA8FF']}
                  tintColor="#2EA8FF"
                  progressViewOffset={20}
                />
              }
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isRefreshing ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator color="#2EA8FF" />
                  </View>
                ) : null
              }
              accessibilityRole="list"
              accessibilityLabel="Lista de oportunidades de emprego"
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
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
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingBottom: 20,
    backgroundColor: '#121214',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleSkeleton: {
    width: 150,
    height: 24,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobList: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 8,
  },
});
