import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function SearchHeader() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const handleBackPress = () => {
    router.back();
  };

  const styles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: 'transparent',
    },
    backButton: {
      marginRight: 16,
      borderStyle: 'solid',
      borderColor: colors.border,
      borderWidth: 0.5,
      padding: 8,
      borderRadius: 50,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
  }), [colors, isDark]);

  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>Pesquisar Oportunidades</Text>
    </View>
  );
}
