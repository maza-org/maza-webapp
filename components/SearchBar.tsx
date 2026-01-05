import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface SearchBarProps {
  onPress: () => void;
  placeholder?: string;
}

export default function SearchBar({ onPress, placeholder = 'Pesquisar...' }: SearchBarProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const searchInputRef = useRef<TextInput>(null);

  const handlePress = () => {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <TextInput
        ref={searchInputRef}
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.text}
        onFocus={handlePress}
        editable={false}
      />
      <Feather name="search" size={20} color={colors.iconColor} style={styles.searchIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
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
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'ManropeRegular',
  },
  searchIcon: {
    marginRight: 8,
  },
});
