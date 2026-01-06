import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export const JobCardSkeleton = () => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonBg = isDark ? '#29292E' : '#E0E0E0';
  const containerBg = colors.cardBackground;
  const borderColor = colors.border;

  return (
    <View style={[styles.container, { backgroundColor: containerBg, borderColor }]}>
      <View style={styles.header}>
        <Animated.View style={[styles.logo, { opacity, backgroundColor: skeletonBg }]} />
        <View style={styles.content}>
          <Animated.View style={[styles.title, { opacity, backgroundColor: skeletonBg }]} />
          <Animated.View style={[styles.company, { opacity, backgroundColor: skeletonBg }]} />
          <View style={styles.meta}>
            <Animated.View style={[styles.metaItem, { opacity, backgroundColor: skeletonBg }]} />
            <Animated.View style={[styles.metaItem, { opacity, backgroundColor: skeletonBg }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  company: {
    height: 16,
    borderRadius: 4,
    marginBottom: 12,
    width: '60%',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    height: 14,
    borderRadius: 4,
    marginRight: 12,
    marginBottom: 4,
    width: 80,
  },
});
