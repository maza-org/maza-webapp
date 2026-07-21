import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  /** Override the spinner colour (defaults to theme primary) */
  color?: string;
  /** Optional label shown below the spinner */
  label?: string;
}

/**
 * Full-area, vertically-centred loading state.
 * Drop this in place of any top-anchored <ActivityIndicator> that serves as
 * a page-level loading screen.
 */
export default function ScreenLoader({ color, label }: Props) {
  const { colors: themeColors } = useTheme();
  const spinnerColor = color ?? themeColors.primary;

  // Gentle fade-in so the loader never feels jarring
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: themeColors.background, opacity }]}
    >
      <View
        style={[
          styles.spinnerContainer,
          { backgroundColor: themeColors.card, borderColor: themeColors.border },
        ]}
      >
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
      {!!label && (
        <Text style={[styles.label, { color: themeColors.textMuted }]}>{label}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 240,
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
});
