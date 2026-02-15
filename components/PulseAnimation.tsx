import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface PulseAnimationProps {
  isPlaying: boolean;
  size?: number;
  color?: string;
}

export default function PulseAnimation({ isPlaying, size = 150, color }: PulseAnimationProps) {
  const { isDark } = useTheme();
  const themeColor = color || (isDark ? Colors.dark.primary : Colors.light.primary);

  // We'll create multiple rings for a nice ripple effect
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.5);

  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.5);

  const ring3Scale = useSharedValue(1);
  const ring3Opacity = useSharedValue(0.5);

  useEffect(() => {
    if (isPlaying) {
      const duration = 2000;
      const easing = Easing.out(Easing.ease);

      // Start animations with staggered delays
      ring1Scale.value = withRepeat(withTiming(1.5, { duration, easing }), -1, false);
      ring1Opacity.value = withRepeat(withTiming(0, { duration, easing }), -1, false);

      ring2Scale.value = withDelay(500, withRepeat(withTiming(1.5, { duration, easing }), -1, false));
      ring2Opacity.value = withDelay(500, withRepeat(withTiming(0, { duration, easing }), -1, false));

      ring3Scale.value = withDelay(1000, withRepeat(withTiming(1.5, { duration, easing }), -1, false));
      ring3Opacity.value = withDelay(1000, withRepeat(withTiming(0, { duration, easing }), -1, false));
    } else {
      cancelAnimation(ring1Scale);
      cancelAnimation(ring1Opacity);
      cancelAnimation(ring2Scale);
      cancelAnimation(ring2Opacity);
      cancelAnimation(ring3Scale);
      cancelAnimation(ring3Opacity);

      // Reset values
      ring1Scale.value = withTiming(1);
      ring1Opacity.value = withTiming(0.5);
      ring2Scale.value = withTiming(1);
      ring2Opacity.value = withTiming(0.5);
      ring3Scale.value = withTiming(1);
      ring3Opacity.value = withTiming(0.5);
    }
  }, [isPlaying, ring1Scale, ring1Opacity, ring2Scale, ring2Opacity, ring3Scale, ring3Opacity]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ring: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: themeColor,
    },
    center: {
      width: size * 0.4,
      height: size * 0.4,
      borderRadius: size * 0.2,
      backgroundColor: themeColor,
      zIndex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, animatedStyle1]} />
      <Animated.View style={[styles.ring, animatedStyle2]} />
      <Animated.View style={[styles.ring, animatedStyle3]} />
      <View style={styles.center} />
    </View>
  );
}
