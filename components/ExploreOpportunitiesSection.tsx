import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

export default function ExploreOpportunitiesSection() {
  const handleExplore = () => {
    router.push('/(tabs)/opportunities');
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Explorar oportunidades</Text>
        <Text style={styles.description}>
          Encontre vagas de emprego, estágios e oportunidades de crescimento profissional na sua área.
        </Text>

        <TouchableOpacity style={styles.exploreButton} onPress={handleExplore} activeOpacity={0.8}>
          <Text style={styles.exploreButtonText}>Ver oportunidades</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#202024',
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
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
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
    marginBottom: 8,
  },
  description: {
    color: '#A8A8B3',
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
    alignSelf: 'center',
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
});
