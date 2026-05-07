import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CustomizeExperienceSection() {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const handleCustomizeSurvey = () => {
    router.push({
      pathname: '/onboarding/self-assessment' as const,
      params: { fromProfile: 'true' },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/customize-experience.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Personalizar Experiência</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Descubra o que combina com você. Responda perguntas rápidas para melhorar suas recomendações.
        </Text>

        <TouchableOpacity style={styles.exploreButton} onPress={handleCustomizeSurvey} activeOpacity={0.8}>
          <Text style={styles.exploreButtonText}>Começar Agora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    position: 'relative',
    height: Platform.OS === 'web' ? 240 : 160,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'ManropeRegular',
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: '#1fa2df',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
});
