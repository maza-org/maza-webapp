import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export const JobCardSkeleton = () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.logo, { opacity }]} />
        <View style={styles.content}>
          <Animated.View style={[styles.title, { opacity }]} />
          <Animated.View style={[styles.company, { opacity }]} />
          <View style={styles.meta}>
            <Animated.View style={[styles.metaItem, { opacity }]} />
            <Animated.View style={[styles.metaItem, { opacity }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#29292E',
  },
  content: {
    flex: 1,
  },
  title: {
    height: 20,
    backgroundColor: '#29292E',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  company: {
    height: 16,
    backgroundColor: '#29292E',
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
    backgroundColor: '#29292E',
    borderRadius: 4,
    marginRight: 12,
    marginBottom: 4,
    width: 80,
  },
});
