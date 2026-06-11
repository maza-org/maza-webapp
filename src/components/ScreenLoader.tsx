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

  // Subtle pulse on the ring behind the spinner
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      {/* Pulsing halo */}
      <Animated.View
        style={[
          styles.halo,
          { borderColor: spinnerColor, transform: [{ scale }] },
        ]}
      />
      <ActivityIndicator size="large" color={spinnerColor} />
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
  halo: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    opacity: 0.2,
  },
  label: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
