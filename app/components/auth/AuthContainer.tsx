import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edges } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        topSection: {
          backgroundColor: isDark ? '#1E1E1E' : colors.cardBackground,
          paddingBottom: 20,
          marginBottom: 10,
        },
      }),
    [colors, isDark]
  );

  return <View style={themedStyles.topSection}>{children}</View>;
}

export function AuthContent({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          flex: 1,
          padding: 24,
          gap: 24,
          backgroundColor: isDark ? '#121212' : colors.background,
        },
      }),
    [colors, isDark]
  );

  return <View style={[themedStyles.content, style]}>{children}</View>;
}

export function AuthForm({ children }: { children: React.ReactNode }) {
  return <View style={styles.formContainer}>{children}</View>;
}

const styles = StyleSheet.create({
  formContainer: {
    gap: 24,
    marginBottom: 32,
    marginTop: 16,
  },
});
