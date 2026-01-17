import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Platform,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

const SKELETON_COUNT = 6;

export default function Opportunities() {
  const { jobs, isLoading, isRefreshing, error, fetchJobs, refreshJobs } = useJobsData();
  const [isErrorBoundary, setIsErrorBoundary] = useState(false);
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 30 : 20,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    titleSkeleton: {
      width: 150,
      height: 24,
      backgroundColor: colors.inputBackground,
      borderRadius: 4,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontFamily: 'ManropeRegular',
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
  }), [colors]);

  const TitleSkeleton = () => <View testID="title-skeleton" style={themedStyles.titleSkeleton} />;

  const SearchBar = ({ onPress }: { onPress: () => void }) => (
    <View style={themedStyles.searchContainer}>
      <TouchableOpacity style={themedStyles.searchBar} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={themedStyles.searchIcon} />
        <TextInput
          style={themedStyles.searchInput}
          placeholder="Pesquisar oportunidades..."
          placeholderTextColor={colors.textMuted}
          onFocus={onPress}
          editable={false}
        />
      </TouchableOpacity>
    </View>
  );

  const SearchBarSkeleton = () => (
    <View style={themedStyles.searchContainer}>
      <Shimmer style={themedStyles.searchBar}>
        <View style={{ height: 24, borderRadius: 8 }} />
      </Shimmer>
    </View>
  );

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
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={themedStyles.header}>
          {isLoading ? <TitleSkeleton /> : <Text style={themedStyles.title}>Oportunidades</Text>}
        </View>

        {isLoading ? <SearchBarSkeleton /> : <SearchBar onPress={handleSearchPress} />}

        <View style={themedStyles.content}>
          {isLoading ? (
            <View style={themedStyles.skeletonContainer}>{renderSkeleton()}</View>
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
              contentContainerStyle={themedStyles.jobList}
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
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                  progressViewOffset={20}
                />
              }
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isRefreshing ? (
                  <View style={themedStyles.footerLoader}>
                    <ActivityIndicator color={colors.primary} />
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
