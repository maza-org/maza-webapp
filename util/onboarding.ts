import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Check if user has completed the onboarding survey
 * @returns Promise<boolean> - true if user has seen onboarding, false otherwise
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem('has_seen_onboarding');
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Set the onboarding completion flag
 */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
}

/**
 * Navigate user based on their onboarding status and interests
 * @param userInterests - Array of user interests (if any)
 */
export async function navigateAfterLogin(userInterests?: any[]): Promise<void> {
  try {
    const hasCompletedOnboarding = await hasSeenOnboarding();

    // If user hasn't seen onboarding survey, redirect there
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding/survey');
      return;
    }

    // If user has interests, go to main app
    if (userInterests && userInterests.length > 0) {
      router.replace('/(tabs)');
    } else {
      // Otherwise, redirect to customize interests
      router.replace('/start/customize');
    }
  } catch (error) {
    console.error('Error navigating after login:', error);
    // Default to main app on error
    router.replace('/(tabs)');
  }
}
