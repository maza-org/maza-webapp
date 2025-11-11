import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUser from '@/hooks/useUser';
import HomepageCategories from '@/components/HomepageCategories';
import HomeHeader from '@/components/HomeHeader';
import SearchBar from '@/components/SearchBar';
import ContinueCourseCard from '@/components/ContinueCourseCard';
import UserCoursesSection from '@/components/UserCoursesSection';
import CourseSection from '@/components/CourseSection';
import { usePopularCourses, useNewCourses, useSuggestedCourses, useUserCourses } from '@/services/home';
import {
  navigateToCourse,
  navigateToCategories,
  navigateToSearch,
  navigateToCourses,
  navigateToCustomize,
} from '@/util/navigation';

export default function Home() {
  const { data: user } = useUser();

  // React Query hooks
  const { data: popularCourses = [], isLoading: loadingPopularCourses } = usePopularCourses();
  const { data: newCourses = [], isLoading: loadingNewCourses } = useNewCourses();
  const { data: suggestedCourses = [], isLoading: loadingSuggestedCourses } = useSuggestedCourses(user?.token);
  const { data: userCourses = [], isLoading: loadingUserCourses } = useUserCourses(user?.token || '');

  // Navigation handlers
  const handleCoursePress = (course: any) => {
    navigateToCourse(course);
  };

  const handlePopularCoursesViewAll = () => {
    navigateToCategories('popular', 'Cursos Populares', 0);
  };

  const handleNewCoursesViewAll = () => {
    navigateToCategories('new', 'Cursos Recentes', 0);
  };

  const handleSuggestedCoursesViewAll = () => {
    navigateToCategories('suggested', 'Cursos Sugeridos', 0);
  };

  const handleUserCoursesViewAll = () => {
    navigateToCourses();
  };

  const handleSearchPress = () => {
    navigateToSearch();
  };

  const handleHeaderPress = () => {
    navigateToCustomize();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HomeHeader onPress={handleHeaderPress} />

        {/* Search Bar */}
        <SearchBar onPress={handleSearchPress} />

        {/* Category Icons */}
        <HomepageCategories />

        {/* Continue Course Section */}
        {user?.token && !loadingUserCourses && userCourses.length > 0 && (
          <View style={styles.courseSection}>
            <ContinueCourseCard userCourse={userCourses[0]} onPress={handleCoursePress} />
          </View>
        )}

        {/* Courses in Progress */}
        {user?.token && userCourses.length > 1 && (
          <UserCoursesSection
            userCourses={userCourses.slice(1)}
            loading={loadingUserCourses}
            onCoursePress={handleCoursePress}
            onViewAll={handleUserCoursesViewAll}
          />
        )}

        {/* Suggested Courses Section */}
        {user?.token && suggestedCourses && suggestedCourses.length > 0 && (
          <CourseSection
            title="Cursos sugeridos"
            courses={suggestedCourses}
            loading={loadingSuggestedCourses}
            onViewAll={handleSuggestedCoursesViewAll}
            onCoursePress={handleCoursePress}
            badge={{ type: 'recommended', icon: 'thumbs-up' }}
          />
        )}

        {/* New Courses Section */}
        <CourseSection
          title="Cursos recentes"
          courses={newCourses}
          loading={loadingNewCourses}
          onViewAll={handleNewCoursesViewAll}
          onCoursePress={handleCoursePress}
          badge={{ type: 'new', icon: 'clock' }}
        />

        {/* Popular Courses */}
        <CourseSection
          title="Cursos populares"
          courses={popularCourses}
          loading={loadingPopularCourses}
          onViewAll={handlePopularCoursesViewAll}
          onCoursePress={handleCoursePress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 25,
    paddingEnd: 25,
    paddingStart: 25,
  },
  scrollContainer: {
    ...(Platform.OS === 'web' ? { paddingHorizontal: 25, paddingVertical: 25 } : undefined),
  },
  courseSection: {
    marginVertical: 10,
  },
});
