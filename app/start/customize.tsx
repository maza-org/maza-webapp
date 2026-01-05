import React, { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/types/user';
import { router, useLocalSearchParams } from 'expo-router';
import { Topic } from '@/app/types/customize';
import { useTopics, useUpdateInterests, useRemoveInterest } from '@/app/hooks/useCustomizeQueries';
import CustomizeHeader from '@/app/components/customize/CustomizeHeader';
import CustomizeContent from '@/app/components/customize/CustomizeContent';
import CustomizeFooter from '@/app/components/customize/CustomizeFooter';
import LoadingState from '@/app/components/customize/LoadingState';
import ErrorState from '@/app/components/customize/ErrorState';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function Customize() {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [initialSelectedTopics, setInitialSelectedTopics] = useState<Topic[]>([]);
  const { interests } = useLocalSearchParams();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const userTopics = useMemo(
    () => (interests ? JSON.parse(interests as string) : []),
    [interests]
  );

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      padding: 24,
    },
  }), [colors]);

  const showBackButton = !!interests;

  const { data: topicsData, isLoading, isError } = useTopics();
  const updateInterestsMutation = useUpdateInterests();
  const removeInterestMutation = useRemoveInterest();

  const topics = topicsData?.data || [];

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('@user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error reading user data:', error);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (topics.length > 0 && userTopics.length > 0) {
      const userSelectedTopics = topics.filter((topic: Topic) =>
        userTopics.some((userTopic: Topic) => userTopic.id === topic.id || userTopic.documentId === topic.documentId)
      );

      if (userSelectedTopics.length > 0) {
        setSelectedTopics(userSelectedTopics);
        setInitialSelectedTopics(userSelectedTopics);
      }
    }
  }, [topics, userTopics]);

  const toggleTopic = (topic: Topic): void => {
    setSelectedTopics((prev) =>
      prev.some((t) => t.id === topic.id) ? prev.filter((t) => t.id !== topic.id) : [...prev, topic]
    );
  };

  const handleConfirm = async (): Promise<void> => {
    if (!user) {
      Alert.alert('Error', 'No user data found. Please try logging in again.');
      return;
    }

    try {
      // Handle removed interests
      if (showBackButton && initialSelectedTopics.length > 0) {
        const removedTopics = initialSelectedTopics.filter(
          (initialTopic) => !selectedTopics.some((currentTopic) => currentTopic.id === initialTopic.id)
        );

        if (removedTopics.length > 0) {
          try {
            await Promise.all(
              removedTopics.map((topic) =>
                removeInterestMutation.mutateAsync({
                  token: user.token,
                  documentId: topic.documentId,
                })
              )
            );
          } catch (error) {
            console.warn('Some interest removals failed:', error);
          }
        }
      }

      // Update interests
      await updateInterestsMutation.mutateAsync({
        token: user.token,
        interests: selectedTopics.map((topic) => topic.documentId),
      });

      // Update local storage
      await AsyncStorage.setItem('@userInterestsUpdated', 'true');
      const updatedUser = {
        ...user,
        interests: selectedTopics,
      };
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));

      router.push('/');
    } catch (error) {
      console.error('Error saving topics:', error);
      Alert.alert('Error', 'Failed to save topics. Please try again.');
    }
  };

  const handleSkip = (): void => {
    router.push('/');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onSkip={handleSkip} />;
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <CustomizeHeader showBackButton={showBackButton} onBackPress={() => router.back()} />

      <ScrollView style={themedStyles.scrollView} showsVerticalScrollIndicator={false}>
        <CustomizeContent topics={topics} selectedTopics={selectedTopics} onTopicToggle={toggleTopic} />
      </ScrollView>

      <CustomizeFooter selectedCount={selectedTopics.length} onConfirm={handleConfirm} onSkip={handleSkip} />
    </SafeAreaView>
  );
}
