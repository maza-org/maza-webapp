import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isDark ? '#1E1E1E' : colors.cardBackground,
        },
      }),
    [colors, isDark]
  );

  return (
    <SafeAreaView style={themedStyles.container} edges={edges}>
      {children}
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
