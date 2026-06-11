import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import HowItWorksStoryScreen from './HowItWorksStoryScreen';

export default function OnboardingScreen({ navigation }: any) {
  useEffect(() => {
    if (Platform.OS === 'web') navigation.replace('Login');
  }, [navigation]);

  if (Platform.OS === 'web') return null;

  return <HowItWorksStoryScreen navigation={navigation} />;
}
