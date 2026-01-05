import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ProfileInfoItemProps {
  icon: string;
  label: string;
  value: string;
  children?: React.ReactNode;
}

export default function ProfileInfoItem({ icon, label, value, children }: ProfileInfoItemProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    infoItem: {
      gap: 12,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    infoValue: {
      color: colors.textSecondary,
      fontSize: 14,
      marginLeft: 28,
    },
  });

  return (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Feather name={icon as any} size={20} color={colors.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {children || <Text style={styles.infoValue}>{value}</Text>}
    </View>
  );
}
