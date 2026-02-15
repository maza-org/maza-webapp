import React, { useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { Journey } from '@/app/types/journeys';
import JourneyItem from '@/app/components/journeys/JourneyItem';
import LoadingState from '@/app/components/categories/LoadingState';
import ErrorState from '@/app/components/categories/ErrorState';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useGetJourneys } from '../hooks/useJourneyQueries';
import EmptyState from '@/app/components/categories/EmptyState';

export default function JourneySelection() {
  const { data: journeys, isLoading, error, refetch } = useGetJourneys();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        categoriesList: {
          padding: 16,
        },
      }),
    [colors]
  );

  const handleCategoryPress = (journey: Journey) => {
    router.push({
      pathname: '/journeys/[id]',
      params: { id: journey.id, name: journey.name, documentId: journey.documentId },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <Header title={'Escolha uma Jornada'} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <Header title={'Escolha uma Jornada'} />
        <ErrorState error={error.message} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <Header title={'Escolha uma Jornada'} />

      <FlatList
        data={journeys?.data?.filter((journey) => journey.courses && journey.courses.length > 0)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <JourneyItem journey={item} onPress={handleCategoryPress} />}
        contentContainerStyle={themedStyles.categoriesList}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma jornada disponível"
            message="No momento não temos jornadas com cursos disponíveis."
          />
        }
      />
    </SafeAreaView>
  );
}
