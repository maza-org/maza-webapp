import React, { useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useCategories } from '@/app/hooks/useCategoriesQueries';
import { Category } from '@/app/types/categories';
import CategoryItem from '@/app/components/categories/CategoryItem';
import LoadingState from '@/app/components/categories/LoadingState';
import ErrorState from '@/app/components/categories/ErrorState';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CategorySelection() {
  const { data: categories, isLoading, error, refetch } = useCategories();
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

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/categories/[id]',
      params: { id: category.id, name: category.name },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <Header title={'Escolha uma categoria'} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <Header title={'Escolha uma categoria'} />
        <ErrorState error={error.message} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <Header title={'Escolha uma categoria'} />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CategoryItem category={item} onPress={handleCategoryPress} />}
        contentContainerStyle={themedStyles.categoriesList}
      />
    </SafeAreaView>
  );
}

