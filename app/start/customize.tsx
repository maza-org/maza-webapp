import React, { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet } from 'react-native';
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
import Toast, { ToastType } from '@/components/Toast';

export default function Customize() {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [initialSelectedTopics, setInitialSelectedTopics] = useState<Topic[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const { interests } = useLocalSearchParams();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const userTopics = useMemo(() => {
    try {
      return interests ? JSON.parse(interests as string) : [];
    }
    catch {
      return [];
    }
  }, [interests]);

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

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirm = async (): Promise<void> => {
    if (!user) {
      showToast('Dados do usuário não encontrados. Tente fazer login novamente.', 'error');
      return;
    }

    setIsConfirming(true);

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

      setIsConfirming(false);
      showToast('Interesses atualizados com sucesso!', 'success');

      // Navigate to profile if coming from profile, otherwise go to home
      setTimeout(() => {
        if (showBackButton) {
          router.push('/profile');
        } else {
          router.push('/');
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving topics:', error);
      setIsConfirming(false);
      showToast('Falha ao salvar os tópicos. Tente novamente.', 'error');
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

      <CustomizeFooter selectedCount={selectedTopics.length} onConfirm={handleConfirm} onSkip={handleSkip} isLoading={isConfirming} />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        position="top"
      />
    </SafeAreaView>
  );
}
