import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useCompactMode } from './CompactModeContext';

interface AuthTitleProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkAction?: () => void;
}

export default function AuthTitle({ title, subtitle, linkText, linkAction }: AuthTitleProps) {
  const { isCompact } = useCompactMode();



  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        titleSection: {
          paddingHorizontal: 24,
          paddingTop: isCompact ? 12 : 24,
        },
        headerText: {
          fontSize: isCompact ? 20 : 28,
          fontWeight: '600',
          color: colors.text,
          width: 200,
          fontFamily: 'ManropeBold',
        },
        linkContainer: {
          flexDirection: 'row',
          marginTop: isCompact ? 6 : 12,
        },
        subtitleText: {
          color: colors.textMuted,
          fontSize: 14,
          fontFamily: 'ManropeRegular',
        },
        linkText: {
          color: colors.primary,
          fontSize: 14,
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors, isCompact]
  );

  return (
    <View style={themedStyles.titleSection}>
      <Text style={themedStyles.headerText}>{title}</Text>

      {subtitle && linkText && (
        <View style={themedStyles.linkContainer}>
          <Text style={themedStyles.subtitleText}>{subtitle} </Text>
          <TouchableOpacity onPress={linkAction}>
            <Text style={themedStyles.linkText}>{linkText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
