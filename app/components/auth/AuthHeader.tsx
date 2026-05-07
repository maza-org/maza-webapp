import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useCompactMode } from './CompactModeContext';

interface AuthHeaderProps {
  showBackButton?: boolean;
}

export default function AuthHeader({ showBackButton = true }: AuthHeaderProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { isCompact } = useCompactMode();

  const buttonSize = isCompact ? 34 : 40;
  const iconSize = isCompact ? 20 : 24;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: 24,
          paddingTop: isCompact ? 8 : 16,
          flexDirection: 'row',
          alignItems: 'center',
        },
        backButton: {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: colors.buttonBackground,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 20,
        },
        logo: {
          width: isCompact ? 97 : 129,
          height: isCompact ? 58 : 78,
        },
      }),
    [isDark, isCompact, buttonSize, colors.buttonBackground]
  );

  return (
    <View style={themedStyles.header}>
      {showBackButton && Platform.OS !== 'web' && (
        <TouchableOpacity onPress={() => router.back()} style={themedStyles.backButton}>
          <Ionicons name="chevron-back" size={iconSize} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}
