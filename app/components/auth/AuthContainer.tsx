import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView, Edges } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useCompactMode } from './CompactModeContext';

interface AuthContainerProps {
  children: React.ReactNode;
  edges?: Edges;
}

export default function AuthContainer({ children, edges = ['top', 'bottom'] }: AuthContainerProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isDesktop ? colors.background : (isDark ? '#1E1E1E' : colors.cardBackground),
          justifyContent: isDesktop ? 'center' : 'flex-start',
        },
        webCard: {
          ...(isDesktop
            ? {
                maxWidth: 480,
                width: '100%',
                alignSelf: 'center',
                backgroundColor: isDark ? '#121212' : colors.cardBackground,
                borderRadius: 24,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 10,
                borderWidth: 1,
                borderColor: colors.border,
                marginVertical: 40,
              }
            : { flex: 1 }),
        },
      }),
    [colors, isDark, isDesktop]
  );

  return (
    <SafeAreaView style={themedStyles.container} edges={edges}>
      <View style={themedStyles.webCard}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function AuthTopSection({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { isCompact } = useCompactMode();

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        topSection: {
          backgroundColor: isDark ? '#1E1E1E' : colors.cardBackground,
          paddingBottom: isCompact ? 12 : 20,
          marginBottom: isCompact ? 4 : 10,
        },
      }),
    [colors, isDark, isCompact]
  );

  return <View style={themedStyles.topSection}>{children}</View>;
}

export function AuthContent({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { isCompact } = useCompactMode();

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          flex: 1,
          padding: isCompact ? 16 : 24,
          gap: isCompact ? 16 : 24,
          backgroundColor: isDark ? '#121212' : colors.background,
        },
      }),
    [colors, isDark, isCompact]
  );

  return <View style={[themedStyles.content, style]}>{children}</View>;
}

export function AuthForm({ children }: { children: React.ReactNode }) {
  const { isCompact } = useCompactMode();

  const formStyles = useMemo(
    () =>
      StyleSheet.create({
        formContainer: {
          gap: isCompact ? 16 : 24,
          marginBottom: isCompact ? 16 : 32,
          marginTop: isCompact ? 8 : 16,
        },
      }),
    [isCompact]
  );

  return <View style={formStyles.formContainer}>{children}</View>;
}
