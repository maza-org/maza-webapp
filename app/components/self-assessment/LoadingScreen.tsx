import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface LoadingScreenProps {
  isDark: boolean;
  colors: any;
  backButtonStyles: any;
  headerTitleStyles: any;
  headerStyles: any;
}

export default function LoadingScreen({
  isDark,
  colors,
  backButtonStyles,
  headerTitleStyles,
  headerStyles,
}: LoadingScreenProps) {
  // Loading animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Typing dots animation
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(dot1Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animateDots());
    };
    animateDots();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={headerStyles}>
        <TouchableOpacity onPress={() => router.back()} style={backButtonStyles}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={headerTitleStyles}>Orientação de Carreira</Text>
      </View>
      <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
        {/* Glowing background ring */}
        <View style={loadingStyles.glowContainer}>
          <Animated.View
            style={[
              loadingStyles.glowRing,
              {
                backgroundColor: isDark ? 'rgba(34, 172, 227, 0.08)' : 'rgba(34, 172, 227, 0.1)',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              loadingStyles.glowRingInner,
              {
                backgroundColor: isDark ? 'rgba(34, 172, 227, 0.15)' : 'rgba(34, 172, 227, 0.18)',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          {/* Rotating sparkle elements */}
          <Animated.View style={[loadingStyles.sparkleContainer, { transform: [{ rotate: spin }] }]}>
            <View style={[loadingStyles.sparkle, { top: 0, left: '50%', marginLeft: -4 }]}>
              <Ionicons name="sparkles" size={16} color={colors.tint} />
            </View>
            <View style={[loadingStyles.sparkle, { bottom: 0, left: '50%', marginLeft: -4 }]}>
              <Ionicons name="star" size={12} color={colors.tint} />
            </View>
            <View style={[loadingStyles.sparkle, { left: 0, top: '50%', marginTop: -4 }]}>
              <Ionicons name="sparkles" size={14} color={colors.tint} />
            </View>
            <View style={[loadingStyles.sparkle, { right: 0, top: '50%', marginTop: -4 }]}>
              <Ionicons name="star" size={14} color={colors.tint} />
            </View>
          </Animated.View>

          {/* Main icon */}
          <Animated.View style={[loadingStyles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[loadingStyles.iconBackground, { backgroundColor: colors.tint }]}>
              <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>

        {/* Title and subtitle */}
        <Text style={[loadingStyles.title, { color: colors.text }]}>Preparando sua jornada</Text>
        <Text style={[loadingStyles.subtitle, { color: isDark ? '#888' : '#666' }]}>
          Nosso assistente está se preparando para te conhecer melhor
        </Text>

        {/* Animated typing indicator */}
        <View style={[loadingStyles.typingContainer, { backgroundColor: isDark ? '#29292E' : '#F0F0F5' }]}>
          <Animated.View style={[loadingStyles.typingDot, { opacity: dot1Anim, backgroundColor: colors.tint }]} />
          <Animated.View style={[loadingStyles.typingDot, { opacity: dot2Anim, backgroundColor: colors.tint }]} />
          <Animated.View style={[loadingStyles.typingDot, { opacity: dot3Anim, backgroundColor: colors.tint }]} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
});

const loadingStyles = StyleSheet.create({
  glowContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  glowRingInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
  },
  sparkle: {
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22ACE3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Manrope-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  typingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
