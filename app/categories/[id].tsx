import React from 'react';
import { Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import useUser from '@/hooks/useUser';
import { useCategoryQuery } from '@/app/hooks/useCategoriesQueries';
import { CourseData } from '@/app/types/categories';
import CourseCard from '@/app/components/categories/CourseCard';
import LoadingShimmer from '@/app/components/categories/LoadingShimmer';
import ErrorComponent from '@/app/components/categories/ErrorComponent';
import EmptyState from '@/app/components/categories/EmptyState';

export default function Category() {
  const { name, id } = useLocalSearchParams();
  const { data: user } = useUser();

  const {
    data: courses,
    isLoading,
    error,
    refetch
  } = useCategoryQuery(
    'category',
    name as string,
    id as string,
    user?.token
  );

  const handlePressCourse = (course: CourseData) => {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  };

  const renderCourseItem = ({ item: course }: { item: CourseData }) => (
    <CourseCard course={course} onPress={handlePressCourse} />
  );


  const ListHeaderComponent = () =>
    !isLoading && courses && courses.length > 0 ? (
      <Text style={styles.coursesAvailable}>
        {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
      </Text>
    ) : null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title={name as string} />
        <LoadingShimmer />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title={name as string} />
        <ErrorComponent error={error.message} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header title={name as string} />

      <FlatList
        data={courses || []}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => <EmptyState />}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  listContent: {
    paddingHorizontal: 24,
  },
  coursesAvailable: {
    color: '#666',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 24,
  },
});
