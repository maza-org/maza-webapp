import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Job } from '@/types/job';
import { JobCard } from '@/components/opportunities/JobCard';

interface SearchResultsProps {
  query: string;
  results: Job[];
  onJobPress: (job: Job) => void;
}

export default function SearchResults({ query, results, onJobPress }: SearchResultsProps) {
  const resultCount = query.trim() ? results.length : null;

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

const styles = StyleSheet.create({
  resultCount: {
    fontSize: 16,
    color: '#8F8F8F',
    marginBottom: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});