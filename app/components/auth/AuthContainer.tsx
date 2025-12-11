import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthContainerProps {
  children: React.ReactNode;
}

export default function AuthContainer({ children }: AuthContainerProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

export function AuthTopSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.topSection}>{children}</View>;
}

export function AuthContent({ children }: { children: React.ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

export function AuthForm({ children }: { children: React.ReactNode }) {
  return <View style={styles.formContainer}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  topSection: {
    backgroundColor: '#1E1E1E',
    paddingBottom: 20,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: '#121212',
  },
  formContainer: {
    gap: 24,
    marginBottom: 32,
    marginTop: 16,
  },
});