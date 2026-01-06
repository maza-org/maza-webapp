import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface AuthHeaderProps {
  showBackButton?: boolean;
}

export default function AuthHeader({ showBackButton = true }: AuthHeaderProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: 24,
          paddingTop: 16,
          flexDirection: 'row',
          alignItems: 'center',
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.buttonBackground,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 20,
        },
        logo: {
          width: 129,
          height: 78,
        },
      }),
    [isDark]
  );

  return (
    <View style={themedStyles.header}>
      {showBackButton && (
        <TouchableOpacity onPress={() => router.back()} style={themedStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <Image source={require('@/assets/images/maza-logo.png')} style={themedStyles.logo} contentFit="contain" />
    </View>
  );
}
