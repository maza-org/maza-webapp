import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SearchBar from './SearchBar';

interface HeroSectionProps {
  onSearchPress: () => void;
}

export default function HeroSection({ onSearchPress }: HeroSectionProps) {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={['#1fa2df', '#126b96']}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>O que você quer aprender hoje?</Text>
          <Text style={styles.heroSubtitle}>Descubra cursos e oportunidades para impulsionar sua carreira.</Text>
          
          <View style={styles.searchWrapper}>
            <SearchBar onPress={onSearchPress} placeholder="Pesquise por cursos, habilidades..." />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    marginBottom: 32,
  },
  heroGradient: {
    width: '100%',
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    width: '100%',
    maxWidth: 800,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'ManropeBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'ManropeRegular',
    textAlign: 'center',
    marginBottom: 40,
  },
  searchWrapper: {
    width: '100%',
    maxWidth: 600,
    // The SearchBar component has a default marginBottom of 24
    // We counteract it or let it add space. Let's wrap it in a container.
    backgroundColor: 'transparent',
  },
});
