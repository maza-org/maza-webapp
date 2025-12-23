import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export default function SearchInput({ value, onChangeText, onClear }: SearchInputProps) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Digite o termo da vaga..."
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        autoFocus
      />
      {value ? (
        <Pressable onPress={onClear} style={styles.clearButton}>
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
