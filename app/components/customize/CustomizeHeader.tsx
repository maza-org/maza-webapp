import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface CustomizeHeaderProps {
  showBackButton: boolean;
  onBackPress: () => void;
}

export default function CustomizeHeader({ showBackButton, onBackPress }: CustomizeHeaderProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [isDark]);

  if (!showBackButton) {
    return null;
  }

  return (
    <View style={themedStyles.header}>
      <TouchableOpacity onPress={onBackPress} style={themedStyles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
