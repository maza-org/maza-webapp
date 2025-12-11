import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import CategoryButton from './CategoryButton';
import { Category } from '@/app/types/search';

interface CategoriesSectionProps {
  categories: Category[];
  handleCategoryPress: (category: { id: number; label: string }) => void;
}

export default function CategoriesSection({ 
  categories, 
  handleCategoryPress 
}: CategoriesSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pesquisar por categoria</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            icon={category.icon}
            label={category.label}
            category={category}
            handlePressCategory={handleCategoryPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8F8F8F',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
});