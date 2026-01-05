import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Job } from '@/types/job';
import { JobCard } from '@/components/opportunities/JobCard';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface SearchResultsProps {
  query: string;
  results: Job[];
  onJobPress: (job: Job) => void;
}

export default function SearchResults({ query, results, onJobPress }: SearchResultsProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const resultCount = query.trim() ? results.length : null;

  const styles = useMemo(() => StyleSheet.create({
    resultCount: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 16,
    },
    listContent: {
      paddingTop: 8,
      paddingBottom: 24,
    },
  }), [colors]);

  return (
    <>
      {query && resultCount !== null && (
        <Text style={styles.resultCount}>
          {resultCount} Resultados para "{query}"
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <JobCard job={item} onPress={onJobPress} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}
