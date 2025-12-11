import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { SearchTagProps } from '@/app/types/search';

export default function SearchTag({ label, onRemove }: SearchTagProps) {
  return (
    <View style={styles.searchTag}>
      <Text style={styles.searchTagText}>{label}</Text>
      <Pressable onPress={onRemove}>
        <Ionicons name="close" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29292E',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchTagText: {
    color: '#fff',
    fontSize: 14,
  },
});