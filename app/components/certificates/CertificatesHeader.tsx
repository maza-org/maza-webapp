import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface CertificatesHeaderProps {
  onBackPress: () => void;
}

export default function CertificatesHeader({ onBackPress }: CertificatesHeaderProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 100,
      padding: 24,
      backgroundColor: colors.cardBackground,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors, isDark]);

  return (
    <View style={themedStyles.header}>
      <TouchableOpacity style={themedStyles.iconButton} onPress={onBackPress}>
        <Feather name="chevron-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={themedStyles.headerTitle}>Meus Certificados</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}
