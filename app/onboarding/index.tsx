import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Dimensions, ScrollView, TouchableOpacity, StatusBar, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Themed from '@/components/Themed';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

// Always use dark mode palette
const theme = Colors['dark'];

interface OnboardingScreen {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const onboardingScreens: OnboardingScreen[] = [
  {
    id: 1,
    title: 'Bem-vindo ao Maza',
    description: 'Descubra oportunidades incríveis e desenvolva suas habilidades com nossos cursos personalizados.',
    icon: 'rocket',
  },
  {
    id: 2,
    title: 'Aprenda no seu ritmo',
    description: 'Acesse cursos de qualidade, complete missões e ganhe certificados reconhecidos pelo mercado.',
    icon: 'school',
  },
  {
    id: 3,
    title: 'Conecte-se com oportunidades',
    description: 'Encontre vagas que combinam com seu perfil e conecte-se com empresas que valorizam seu crescimento.',
    icon: 'briefcase',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar when currentIndex changes
    Animated.timing(progressAnimation, {
      toValue: (currentIndex + 1) / onboardingScreens.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, progressAnimation]);

  const handleNext = () => {
    if (currentIndex < onboardingScreens.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    router.replace('/(tabs)');
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingScreens.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, { backgroundColor: index === currentIndex ? theme.tint : theme.tabIconDefault }]}
        />
      ))}
    </View>
  );

  // Progress bar indicator
  const renderProgressBar = () => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* ScrollView for screens */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingScreens.map((screen) => (
          <Themed.View key={screen.id} style={[styles.screen, { width, backgroundColor: theme.background }]}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(52,133,255,0.1)' }]}>
              <Ionicons name={screen.icon} size={80} color={theme.tint} />
            </View>
            <Themed.Text style={[styles.title, { color: theme.text }]}>{screen.title}</Themed.Text>
            <Themed.Text style={[styles.description, { color: theme.text, opacity: 0.7 }]}>
              {screen.description}
            </Themed.Text>
          </Themed.View>
        ))}
      </ScrollView>

      {/* Next/Get Started Button */}
      <View style={styles.buttonContainer}>
        <Button handle={handleNext} text={currentIndex === onboardingScreens.length - 1 ? 'Começar' : 'Próximo'} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  screen: {
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  progressBarBackground: {
    width: '85%',
    height: 6,
    backgroundColor: '#232323',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: theme.tint,
    borderRadius: 3,
  },
});
