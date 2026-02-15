import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import useUser from '@/hooks/useUser';
import { CourseData } from '@/app/types/categories';
import CourseCard from '@/app/components/categories/CourseCard';
import LoadingShimmer from '@/app/components/categories/LoadingShimmer';
import ErrorComponent from '@/app/components/categories/ErrorComponent';
import EmptyState from '@/app/components/categories/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useGetJourneyCourses } from '../hooks/useJourneyQueries';
import { usePopularCourses, useNewCourses, useSuggestedCourses, useAllSubjects } from '@/services/home';
import CategoryFilter from '@/app/components/journeys/CategoryFilter';
import { useCategories } from '../hooks/useCategoriesQueries';

export default function JourneyScreen() {
  const { name, documentId, type } = useLocalSearchParams();
  const { data: user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const {
    data: journeyCourses,
    isLoading: loadingJourney,
    error: errorJourney,
    refetch,
  } = useGetJourneyCourses(documentId as string);

  const { data: popularCourses, isLoading: loadingPopular } = usePopularCourses();
  const { data: newCourses, isLoading: loadingNew } = useNewCourses();
  const { data: suggestedCourses, isLoading: loadingSuggested } = useSuggestedCourses(user?.token);
  const { data: categories } = useCategories();

  let courses = journeyCourses;
  let isLoading = loadingJourney;
  let error = errorJourney;

  if (type === 'popular') {
    courses = popularCourses;
    isLoading = loadingPopular;
    error = null;
  } else if (type === 'new') {
    courses = newCourses;
    isLoading = loadingNew;
    error = null;
  } else if (type === 'suggested') {
    courses = suggestedCourses;
    isLoading = loadingSuggested;
    error = null;
  }

  // console.log(JSON.stringify(error, null, 2));

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!selectedCategory) return courses;
    return courses.filter((course: any) => course.subjects?.some((subject: any) => subject.name === selectedCategory));
  }, [courses, selectedCategory]);

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        listContent: {
          paddingHorizontal: 24,
        },
        headerContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          marginBottom: 16,
          marginHorizontal: 24,
        },
        coursesAvailable: {
          color: colors.textSecondary,
          fontSize: 16,
        },
      }),
    [colors]
  );

  const handlePressCourse = (course: CourseData) => {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  };

  const renderCourseItem = ({ item: course }: { item: any }) => (
    <CourseCard course={course} onPress={handlePressCourse} />
  );

  const ListHeaderComponent = () => (
    <View style={themedStyles.headerContainer}>
      <Text style={themedStyles.coursesAvailable}>
        {!isLoading && filteredCourses ? (
          <>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}
          </>
        ) : null}
      </Text>
      <CategoryFilter
        categories={categories || []}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <Header title={name as string} />
        <LoadingShimmer />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <Header title={name as string} />
        <ErrorComponent error={error.message} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <Header title={name as string} />

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={themedStyles.listContent}
        ListEmptyComponent={() => <EmptyState />}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
}
