import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SearchBarProps {
  onPress: () => void;
  placeholder?: string;
}

export default function SearchBar({ onPress, placeholder = 'Pesquisar...' }: SearchBarProps) {
  const searchInputRef = useRef<TextInput>(null);

  const handlePress = () => {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    onPress();
  };

  return (
    <TouchableOpacity style={styles.searchContainer} onPress={handlePress} activeOpacity={0.7}>
      <TextInput
        ref={searchInputRef}
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#666"
        selectionColor="#fff"
        onFocus={handlePress}
        editable={false}
      />
      <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
    </TouchableOpacity>
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
    marginLeft: 8,
    fontFamily: 'ManropeRegular',
  },
  searchIcon: {
    marginRight: 8,
  },
});
