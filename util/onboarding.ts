import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { baseUrl } from '@/services/api';

/**
 * Check if user has completed the onboarding survey
 * @returns Promise<boolean> - true if user has completed survey, false otherwise
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    // Get the user token from AsyncStorage
    const userDataString = await AsyncStorage.getItem('@user');
    if (!userDataString) {
      return false;
    }

    const userData = JSON.parse(userDataString);
    if (!userData.token) {
      return false;
    }

    // Fetch user data from API to check if survey is completed
    const response = await fetch(`${baseUrl}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user data:', response.status);
      return false;
    }

    const userResponse = await response.json();

    // Check if user has completed the survey
    // Survey is considered complete if it exists and has at least one answer
    return userResponse.survey && Array.isArray(userResponse.survey) && userResponse.survey.length > 0;
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
