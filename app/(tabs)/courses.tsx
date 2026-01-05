import React, { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteCoursesGrid from '@/components/FavoriteCoursesGrid';
import CoursesInProgress from '@/components/CourseInProgress';
import useUser from '@/hooks/useUser';
import {
  LoginPrompt,
  CompletedCourses,
  CoursesHeader,
  CoursesTabs,
  FilterOptions,
  CourseTabType,
} from '@/app/components/courses';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function Courses() {
  const { data: user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<CourseTabType>('inProgress');
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  }), [colors]);

  if (!user?.token) {
    return <LoginPrompt />;
  }

  const handleFilterApply = (filters: FilterOptions) => {};

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <CoursesHeader />
      <CoursesTabs selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
      {selectedFilter === 'favorites' && <FavoriteCoursesGrid />}
      {selectedFilter === 'completed' && <CompletedCourses />}
      {selectedFilter === 'inProgress' && <CoursesInProgress />}
    </SafeAreaView>
  );
}
