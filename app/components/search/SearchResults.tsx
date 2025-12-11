import React from 'react';
import { Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import CourseItem from './CourseItem';
import { SearchResult } from '@/app/types/search';
import { Course } from '@/types/course';

interface SearchResultsProps {
  searchTerm: string;
  resultCount: number | null;
  loading: boolean;
  results: SearchResult[];
  handleOpenCourse: (course: Course) => void;
}

export default function SearchResults({ 
  searchTerm, 
  resultCount, 
  loading, 
  results, 
  handleOpenCourse 
}: SearchResultsProps) {
  const renderItem = ({ item }: { item: SearchResult }) => (
    <CourseItem item={item} onPress={() => handleOpenCourse(item)} />
  );

  if (!searchTerm || resultCount === null) {
    return null;
  }

  return (
    <>
      <Text style={styles.resultCount}>
        {resultCount} Resultados para "{searchTerm}"
      </Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8257E5" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  resultCount: {
    fontSize: 16,
    color: '#8F8F8F',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  flatListContent: {
    paddingTop: 8,
  },
});