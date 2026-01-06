import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface TabProps {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

export function Tab({ active, onPress, children }: TabProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = useMemo(() => StyleSheet.create({
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '500',
    },
    activeTabText: {
      color: colors.primary,
    },
  }), [colors]);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{children}</Text>
    </TouchableOpacity>
  );
}
