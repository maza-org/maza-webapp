import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface AuthHeaderProps {
  showBackButton?: boolean;
}

export default function AuthHeader({ showBackButton = true }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <Image source={require('@/assets/images/maza-logo.png')} style={styles.logo} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
    marginRight: 20,
  },
  logo: {
    width: 129,
    height: 78,
  },
});
