import React from 'react';
import { TextInput, Pressable, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}

export default function SearchInput({ searchTerm, onSearchChange, onClearSearch }: SearchInputProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    searchContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 44,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 16,
      marginRight: 8,
      fontFamily: 'ManropeRegular',
    },
    clearButton: {
      padding: 4,
    },
  });

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar cursos"
        placeholderTextColor={colors.textMuted}
        value={searchTerm}
        onChangeText={onSearchChange}
        selectionColor={colors.primary}
      />
      {searchTerm ? (
        <Pressable onPress={onClearSearch} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : (
        <Ionicons name="search" size={20} color={colors.textMuted} />
      )}
    </View>
  );
}
