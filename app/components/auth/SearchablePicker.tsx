import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchablePickerProps } from '@/app/types/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function SearchablePicker({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Selecione uma opção',
  error,
}: SearchablePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    picker: {
      height: 48,
      backgroundColor: colors.inputBackground,
      borderRadius: 24,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: error ? '#FF6B6B' : 'transparent',
    },
    pickerText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    placeholder: {
      color: colors.textMuted,
    },
    errorText: {
      color: '#FF6B6B',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    searchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      margin: 20,
      fontSize: 16,
      color: colors.text,
    },
    optionsList: {
      paddingHorizontal: 20,
    },
    optionItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
  }), [colors, error]);

  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    return options.filter((option) => option.toLowerCase().includes(searchText.toLowerCase()));
  }, [options, searchText]);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsVisible(false);
    setSearchText('');
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item)}>
      <Text style={styles.optionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setIsVisible(true)}>
        <Text style={[styles.pickerText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isVisible} animationType="slide" transparent onRequestClose={() => setIsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
