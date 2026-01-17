import React from 'react';
import { Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import CourseItem from './CourseItem';
import { SearchResult } from '@/app/types/search';
import { Course } from '@/types/course';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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
  handleOpenCourse,
}: SearchResultsProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    resultCount: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 16,
      fontFamily: 'ManropeRegular',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    flatListContent: {
      paddingTop: 8,
    },
  });

  const renderItem = ({ item }: { item: SearchResult }) => (
    <CourseItem item={item} onPress={() => handleOpenCourse(item as unknown as Course)} />
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
          <ActivityIndicator size="large" color={colors.primary} />
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
