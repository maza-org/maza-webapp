import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableOpacityProps,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/types/user';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { baseUrl } from '@/services/api';

interface TopicButtonProps extends TouchableOpacityProps {
  topic: string;
  isSelected: boolean;
}

interface Topic {
  id: number;
  documentId: string;
  name: string;
}

function TopicButton({ topic, isSelected, onPress, ...props }: TopicButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.topicButton, isSelected && styles.topicButtonSelected]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>{topic}</Text>
    </TouchableOpacity>
  );
}

export default function Customize() {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [initialSelectedTopics, setInitialSelectedTopics] = useState<Topic[]>([]);
  const { interests } = useLocalSearchParams();
  const userTopics = interests ? JSON.parse(interests as string) : [];

  // Show back button only when coming from profile (when interests param is present)
  const showBackButton = !!interests;

  useEffect(() => {
    const initialize = async () => {
      try {
        // Read the saved user data
        const userString = await AsyncStorage.getItem('@user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
        } else {
          console.log('No user data found');
        }

        // Fetch topics
        await fetchTopics();
      } catch (error) {
        console.error('Error initializing:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${baseUrl}/subjects?fields=name&sort=name`);
      const { data } = await response.json();

      if (!data || data.length === 0) {
        setHasError(true);
        setTopics([]);
        return;
      }

      setTopics(data);
      setHasError(false);

      // Mark user's existing topics as selected
      if (userTopics && userTopics.length > 0) {
        // Find the Topic objects that match the user's interests
        const userSelectedTopics = data.filter((topic: Topic) =>
          userTopics.some((userTopic: Topic) => userTopic.id === topic.id || userTopic.documentId === topic.documentId)
        );

        if (userSelectedTopics.length > 0) {
          setSelectedTopics(userSelectedTopics);
          // Store initial selection for comparison
          setInitialSelectedTopics(userSelectedTopics);
        }
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setHasError(true);
      setTopics([]);
    }
  };

  const toggleTopic = (topic: Topic): void => {
    setSelectedTopics((prev) =>
      prev.some((t) => t.id === topic.id) ? prev.filter((t) => t.id !== topic.id) : [...prev, topic]
    );
  };

  const removeInterest = async (documentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/users-permissions/interests/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to remove interest ${documentId}:`, response.status);
        return false;
      }

      const result = await response.json();
      console.log(`Successfully removed interest ${documentId}:`, result);
      return true;
    } catch (error) {
      console.error(`Error removing interest ${documentId}:`, error);
      return false;
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!user) {
      Alert.alert('Error', 'No user data found. Please try logging in again.');
      return;
    }
    console.log('user data:', { user });
    try {
      setIsLoading(true);

      // If this is the first open (coming from profile) and there were initially selected topics
      if (showBackButton && initialSelectedTopics.length > 0) {
        // Find removed interests (topics that were initially selected but are no longer selected)
        const removedTopics = initialSelectedTopics.filter(
          (initialTopic) => !selectedTopics.some((currentTopic) => currentTopic.id === initialTopic.id)
        );

        console.log('Removed topics:', removedTopics);

        // Remove each unselected interest
        if (removedTopics.length > 0) {
          const removalPromises = removedTopics.map((topic) => removeInterest(topic.documentId));
          const removalResults = await Promise.all(removalPromises);

          const failedRemovals = removalResults.filter((success) => !success).length;
          if (failedRemovals > 0) {
            console.warn(`${failedRemovals} interest removals failed`);
          }
        }
      }

      // Make the API call to update user interests
      const response = await fetch(`${baseUrl}/users-permissions/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          data: {
            interests: selectedTopics.map((topic) => topic.documentId),
          },
        }),
      });
      if (!response.ok) {
        console.log(response.status);
        console.log(JSON.stringify(user, null, 2));
        console.log(
          JSON.stringify(
            selectedTopics.map((topic) => topic.documentId),
            null,
            2
          )
        );
        throw new Error('Failed to update interests');
      }
      // Save to AsyncStorage that user has updated their interests
      await AsyncStorage.setItem('@userInterestsUpdated', 'true');
      // Update the user object in AsyncStorage with new interests
      const updatedUser = {
        ...user,
        interests: selectedTopics,
      };

      console.log(`response`, await response.json());
      console.log(response.status);
      console.log(`user in customize`, JSON.stringify(updatedUser, null, 2));
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));

      // Navigate to home screen
      router.push('/');
    } catch (error) {
      console.error('Error saving topics:', error);
      Alert.alert('Error', 'Failed to save topics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = (): void => {
    console.log('Skipped topic selection');
    router.push('/');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1fa2df" />
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#A8A8B3" />
          <Text style={styles.errorTitle}>Não foi possível carregar os temas</Text>
          <Text style={styles.errorMessage}>
            Ocorreu um erro ao carregar os temas disponíveis. Pode continuar sem personalizar a sua experiência.
          </Text>
          <TouchableOpacity style={styles.errorSkipButton} onPress={handleSkip}>
            <Text style={styles.errorSkipButtonText}>Continuar para a aplicação</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {showBackButton && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Text style={styles.title}>Personalizar a sua experiência</Text>
          <Text style={styles.subtitle}>
            Escolha os temas que mais lhe interessam para que possamos criar uma experiência personalizada
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Escolha os temas do seu interesse</Text>

        <View style={styles.topicsContainer}>
          {topics.map((topic, index) => (
            <TopicButton
              key={`${topic.name}-${index}`}
              topic={topic.name}
              isSelected={selectedTopics.some((t) => t.id === topic.id)}
              onPress={() => toggleTopic(topic)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, selectedTopics.length === 0 && styles.confirmButtonDisabled]}
          disabled={selectedTopics.length === 0}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Deixar para depois</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  contentHeader: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#A8A8B3',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#202024',
    borderWidth: 1,
    borderColor: '#323238',
  },
  topicButtonSelected: {
    backgroundColor: '#323238',
    borderColor: '#22ACE3',
  },
  topicText: {
    color: '#A8A8B3',
    fontSize: 14,
  },
  topicTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  confirmButton: {
    backgroundColor: '#22ACE3',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#29292E',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#A8A8B3',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#A8A8B3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorSkipButton: {
    backgroundColor: '#1fa2df',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
  },
  errorSkipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
