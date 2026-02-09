import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useCompactMode } from './CompactModeContext';

interface AuthFooterProps {
  linkText?: string;
  onLinkPress?: () => void;
}

export default function AuthFooter({ linkText, onLinkPress }: AuthFooterProps) {
  const { isCompact } = useCompactMode();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  if (isCompact || !linkText || !onLinkPress) return null;

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={onLinkPress}>
        <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerLinkText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
