import React, { useMemo } from 'react';
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
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function Category() {
  const { type, name, id } = useLocalSearchParams();
  const { data: user } = useUser();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const {
    data: courses,
    isLoading,
    error,
    refetch,
  } = useCategoryQuery((type as string) || 'category', name as string, id as string, user?.token);

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
        coursesAvailable: {
          color: colors.textSecondary,
          fontSize: 16,
          marginTop: 24,
          marginBottom: 16,
          marginLeft: 24,
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

  const renderCourseItem = ({ item: course }: { item: CourseData }) => (
    <CourseCard course={course} onPress={handlePressCourse} />
  );

  const ListHeaderComponent = () =>
    !isLoading && courses && courses.length > 0 ? (
      <Text style={themedStyles.coursesAvailable}>
        {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
      </Text>
    ) : null;

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
        data={courses || []}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={themedStyles.listContent}
        ListEmptyComponent={() => <EmptyState />}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
}

