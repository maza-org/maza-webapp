import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface AuthTitleProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkAction?: () => void;
}

export default function AuthTitle({ title, subtitle, linkText, linkAction }: AuthTitleProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        titleSection: {
          paddingHorizontal: 24,
          paddingTop: 24,
        },
        headerText: {
          fontSize: 28,
          fontWeight: '600',
          color: colors.text,
          width: 200,
        },
        linkContainer: {
          flexDirection: 'row',
          marginTop: 12,
        },
        subtitleText: {
          color: colors.textMuted,
          fontSize: 14,
        },
        linkText: {
          color: colors.primary,
          fontSize: 14,
        },
      }),
    [colors]
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
