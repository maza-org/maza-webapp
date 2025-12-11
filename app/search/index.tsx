import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from '@/components/Themed';
import { router } from 'expo-router';
import { Course } from '@/types/course';
import { useSearchCourses } from '@/app/hooks/useSearchQueries';
import { SearchResult } from '@/app/types/search';
import SearchHeader from '@/app/components/search/SearchHeader';
import SearchInput from '@/app/components/search/SearchInput';
import CategoriesSection from '@/app/components/search/CategoriesSection';
import SearchResults from '@/app/components/search/SearchResults';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: searchData, 
    isLoading, 
    error 
  } = useSearchCourses(searchTerm);

  const handleBackPress = () => {
    router.back();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  const categories = [
    { id: 43, icon: 'brush', label: 'Design' },
    { id: 71, icon: 'laptop', label: 'Tecnologia' },
    { id: 69, icon: 'heart', label: 'Saúde e Bem-estar' },
    { id: 45, icon: 'cash', label: 'Finanças' },
  ];

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
      pathname: '/categories/[id]',
      params: {
        id: category.id,
        name: category.label,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <SearchHeader onBackPress={handleBackPress} />
      
      <SearchInput 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      {!searchTerm && (
        <CategoriesSection 
          categories={categories}
          handleCategoryPress={handleCategoryPress}
        />
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 25,
    paddingStart: 25,
    paddingEnd: 25,
  },
});
