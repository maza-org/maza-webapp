import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { Category } from '@/app/types/categories';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        filterButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        filterText: {
          fontSize: 14,
          fontFamily: 'ManropeMedium',
          color: colors.textSecondary,
        },
        activeFilter: {
          color: colors.primary,
          fontFamily: 'ManropeBold',
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalContent: {
          width: '80%',
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 16,
          maxHeight: '60%',
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        modalTitle: {
          fontSize: 18,
          fontFamily: 'ManropeBold',
          color: colors.text,
        },
        categoryItem: {
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        categoryText: {
          fontSize: 16,
          fontFamily: 'ManropeRegular',
          color: colors.text,
        },
        selectedCategoryText: {
          color: colors.primary,
          fontFamily: 'ManropeBold',
        },
      }),
    [colors]
  );

  const handleSelect = (category: string | null) => {
    onSelect(category);
    setModalVisible(false);
  };

  return (
    <View style={themedStyles.container}>
      <TouchableOpacity style={themedStyles.filterButton} onPress={() => setModalVisible(true)}>
        <Text style={[themedStyles.filterText, selectedCategory && themedStyles.activeFilter]}>Categorias</Text>
        <Ionicons
          name={selectedCategory ? 'filter' : 'filter-outline'}
          size={20}
          color={selectedCategory ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={themedStyles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={themedStyles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Filtrar por Categoria</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ id: 'todas', name: 'Todas' }, ...categories]}
              keyExtractor={(item) => (typeof item === 'string' ? item : item.id.toString())}
              renderItem={({ item }) => {
                const isAllCategories = item.id === 'todas';
                const categoryName = item.name;
                const isSelected = isAllCategories ? selectedCategory === null : selectedCategory === categoryName;
                return (
                  <TouchableOpacity
                    style={themedStyles.categoryItem}
                    onPress={() => handleSelect(isAllCategories ? null : categoryName)}
                  >
                    <Text style={[themedStyles.categoryText, isSelected && themedStyles.selectedCategoryText]}>
                      {categoryName}
                    </Text>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                        style={{ position: 'absolute', right: 8, top: 12 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
