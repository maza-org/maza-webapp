import React from 'react';
import { TextInput, Pressable, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}

export default function SearchInput({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch 
}: SearchInputProps) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar cursos"
        placeholderTextColor="#666"
        value={searchTerm}
        onChangeText={onSearchChange}
      />
      {searchTerm ? (
        <Pressable onPress={onClearSearch} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#666" />
        </Pressable>
      ) : (
        <Ionicons name="search" size={20} color="#666" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#202024',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
});