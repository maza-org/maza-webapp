import { SafeAreaView, StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text } from '@/components/Themed';
import { useCallback } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Job } from '@/types/job';
import { useJobsData } from '@/hooks/useJobsData';
import { ErrorState, EmptyState, LoadingState } from '@/components/opportunities/StateComponents';
import { JobCard } from '@/components/opportunities/JobCard';

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
