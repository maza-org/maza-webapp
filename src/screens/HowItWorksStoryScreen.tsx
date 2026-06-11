import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Platform, ImageBackground, Image, BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { bottomSafeSpace } from '../utils/safeArea';
import { useAuth } from '../context/AuthContext';

const STORY_DURATION = 5000;

const STORIES = [
  {
    id: 0,
    title: 'Bem-vindo ao Maza!',
    text: 'Aprenda novas habilidades, acompanhe o seu progresso e impulsione o seu futuro com o Maza.',
    image: require('../../assets/onboarding_student_1.jpg'),
    accent: '#3B82F6',
    ctaLabel: 'Criar Conta',
    ctaRoute: 'Register',
  },
  {
    id: 1,
    title: 'Escolha como se registar',
    text: 'Pode criar a sua conta usando o seu número de telemóvel ou email. Ambas as opções são rápidas e seguras.',
    image: require('../../assets/onboarding_student_2.jpg'),
    accent: '#8B5CF6',
    ctaLabel: 'Registar Agora',
    ctaRoute: 'Register',
  },
  {
    id: 2,
    title: 'Verifique a sua identidade',
    text: 'Vamos enviar um código de verificação para confirmar o seu contacto. Isto ajuda a manter a sua conta segura.',
    image: require('../../assets/onboarding_student_3.jpg'),
    accent: '#6366F1',
    ctaLabel: 'Iniciar sessão',
    ctaRoute: 'Login',
  },
  {
    id: 3,
    title: 'Complete o seu perfil',
    text: 'Adicione o seu nome e foto para personalizar a sua experiência. Pode também selecionar os seus interesses.',
    image: require('../../assets/onboarding_student_4.jpg'),
    accent: '#EC4899',
    ctaLabel: 'Criar Conta',
    ctaRoute: 'Register',
  },
  {
    id: 4,
    title: 'Comece a aprender!',
    text: 'Após criar a conta, terá acesso a centenas de cursos gratuitos. Acompanhe o seu progresso e obtenha certificados.',
    image: require('../../assets/onboarding_student_5.jpg'),
    accent: '#10B981',
    ctaLabel: 'Começar Agora →',
    ctaRoute: null, // close story → Main
  },
];

export default function HowItWorksStoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pausedProgressRef = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') StatusBar.setHidden(true);
    return () => { if (Platform.OS !== 'web') StatusBar.setHidden(false); };
  }, []);

  useEffect(() => {
    pausedProgressRef.current = 0;
    progressAnim.setValue(0);
    startAnimation(0);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) {
      animationRef.current?.stop();
      progressAnim.stopAnimation((value) => { pausedProgressRef.current = value; });
    } else {
      startAnimation(pausedProgressRef.current);
    }
  }, [isPaused]);

  const startAnimation = useCallback((fromValue: number) => {
    progressAnim.setValue(fromValue);
    const remaining = STORY_DURATION * (1 - fromValue);
    const anim = Animated.timing(progressAnim, {
      toValue: 1, duration: remaining, useNativeDriver: false,
    });
    animationRef.current = anim;
    anim.start(({ finished }) => { if (finished) goToNext(); });
  }, [currentIndex]);

  const closeStory = useCallback(() => {
    const routeNames = navigation.getState?.()?.routeNames ?? [];
    if (!user && routeNames.includes('Login')) { navigation.replace('Login'); return; }
    if (navigation.canGoBack()) { navigation.goBack(); return; }
    navigation.navigate('Main');
  }, [navigation, user]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        closeStory();
        return true;
      });
      return () => sub.remove();
    }, [closeStory])
  );

  const handleCta = (route: string | null) => {
    if (!route) { closeStory(); return; }
    navigation.navigate(route as never);
  };

  const goToNext = () => {
    if (currentIndex < STORIES.length - 1) setCurrentIndex(i => i + 1);
    else closeStory();
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    } else {
      pausedProgressRef.current = 0;
      progressAnim.setValue(0);
      startAnimation(0);
    }
  };

  const handlePressIn = () => setIsPaused(true);
  const handlePressOut = () => setIsPaused(false);

  const currentStory = STORIES[currentIndex];
  const ctaLabel = user
    ? currentIndex < STORIES.length - 1 ? 'Próximo' : 'Fechar'
    : currentStory.ctaLabel;
  const ctaRoute = user ? null : currentStory.ctaRoute;

  return (
    <View style={styles.container}>
      {/* Full-screen background photo */}
      <ImageBackground
        source={currentStory.image}
        style={styles.backgroundLayer}
        imageStyle={styles.backgroundPhoto}
        resizeMode="cover"
      />

      {/* Dark gradient overlay — stronger at bottom for text legibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {STORIES.map((story, i) => {
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;
            return (
              <View key={story.id} style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: isActive
                        ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                        : isPast ? '100%' : '0%',
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* MAZA logo — top left */}
        <View style={styles.logoRow}>
          <Image
            source={require('../../assets/maza-logo-branco.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          {/* Close button */}
          <TouchableOpacity onPress={closeStory} style={styles.closeButton}>
            <X size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Pause indicator */}
        {isPaused && (
          <View style={styles.pauseIndicator}>
            <Ionicons name="pause" size={48} color="rgba(255,255,255,0.8)" />
          </View>
        )}

        {/* Text content pinned to bottom */}
        <View
          style={[
            styles.contentContainer,
            { bottom: bottomSafeSpace(insets.bottom, 100) },
          ]}
          pointerEvents="none"
        >
          {/* Blue accent pill behind counter */}
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{currentIndex + 1}/{STORIES.length}</Text>
          </View>
          <Text style={styles.title}>{currentStory.title}</Text>
          <Text style={styles.description}>{currentStory.text}</Text>
        </View>

        {/* CTA button — every slide — solid blue */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            { bottom: bottomSafeSpace(insets.bottom, 20) },
          ]}
          onPress={() => handleCta(ctaRoute)}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>

        {/* Touch zones — left: prev | right: next | hold: pause */}
        <View style={styles.touchZones} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.touchZoneLeft}
            activeOpacity={1}
            onPress={goToPrev}
            onLongPress={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={150}
          />
          <TouchableOpacity
            style={styles.touchZoneRight}
            activeOpacity={1}
            onPress={goToNext}
            onLongPress={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={150}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', overflow: 'hidden' },
  backgroundPhoto: { width: '100%', height: '100%' },
  safeArea: { flex: 1, width: '100%', overflow: 'hidden' },

  progressContainer: {
    flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, gap: 4, zIndex: 10,
  },
  progressTrack: {
    flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },

  // Logo row (top)
  logoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, zIndex: 10,
  },
  logoImg: { width: 110, height: 44 },
  closeButton: {
    padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)',
  },

  pauseIndicator: {
    position: 'absolute', top: '50%', left: '50%',
    marginLeft: -24, marginTop: -24,
    zIndex: 20, opacity: 0.9,
  },

  // Text pinned to bottom
  contentContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    zIndex: 5,
  },

  // Counter pill
  counterPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#29B6F6',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 12,
  },
  counterText: {
    color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF', fontSize: 32, fontWeight: '800',
    marginBottom: 14, lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  description: {
    color: 'rgba(255,255,255,0.85)', fontSize: 16,
    lineHeight: 25, fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  touchZones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', zIndex: 1 },
  touchZoneLeft: { flex: 0.35 },
  touchZoneRight: { flex: 0.65 },

  ctaButton: {
    position: 'absolute', bottom: 32, left: 28, right: 28,
    backgroundColor: '#29B6F6',
    paddingVertical: 16, borderRadius: 30, alignItems: 'center', zIndex: 20,
    shadowColor: '#29B6F6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
});
