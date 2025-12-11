import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useCategories } from '@/app/hooks/useCategoriesQueries';
import { Category } from '@/app/types/categories';
import CategoryItem from '@/app/components/categories/CategoryItem';
import LoadingState from '@/app/components/categories/LoadingState';
import ErrorState from '@/app/components/categories/ErrorState';


export default function CategorySelection() {
  const { data: categories, isLoading, error, refetch } = useCategories();

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/categories/[id]',
      params: { id: category.id, name: category.name },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title={'Escolha uma categoria'} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title={'Escolha uma categoria'} />
        <ErrorState error={error.message} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header title={'Escolha uma categoria'} />

      <View style={styles.categoriesList}>
        {categories?.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            onPress={handleCategoryPress}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  categoriesList: {
    padding: 16,
  },
});
