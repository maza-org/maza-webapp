import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from '@/components/Themed';
import { router } from 'expo-router';
import { Course } from '@/types/course';
import { useSearchCourses } from '@/app/hooks/useSearchQueries';
import { SearchResult } from '@/app/types/search';
import SearchHeader from '@/app/components/search/SearchHeader';
import SearchInput from '@/app/components/search/SearchInput';
import JourneysSection from '@/app/components/search/JourneysSection';
import SearchResults from '@/app/components/search/SearchResults';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useGetJourneys } from '../hooks/useJourneyQueries';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: searchData, isLoading, error } = useSearchCourses(searchTerm);
  const { data: journeysQuery } = useGetJourneys();

  const handleBackPress = () => {
    router.back();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  // Map journeys to the format expected by JourneysSection
  const journeys =
    journeysQuery?.data?.map((journey) => ({
      id: journey.id,
      icon: 'compass-outline', // Default icon for journeys
      label: journey.name,
    })) || [];

  function handleOpenCourse(course: Course) {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  }

  function handleCategoryPress(category: { id: number; label: string }) {
    router.push({
      pathname: '/journeys/[id]',
      params: {
        id: category.id,
        name: category.label,
      },
    });
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 25,
      paddingStart: 25,
      paddingEnd: 25,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SearchHeader onBackPress={handleBackPress} />

      <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} onClearSearch={handleClearSearch} />

      {!searchTerm && <JourneysSection journeys={journeys} handleCategoryPress={handleCategoryPress} />}

      <SearchResults
        searchTerm={searchTerm}
        resultCount={searchData?.meta.pagination.total || null}
        loading={isLoading}
        results={searchData?.data || []}
        handleOpenCourse={handleOpenCourse}
      />
    </SafeAreaView>
  );
}
