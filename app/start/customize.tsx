import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TouchableOpacityProps,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { User } from '@/types/user';
import { router, useLocalSearchParams } from 'expo-router';

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
  const [user, setUser] = useState<User | null>(null);
  const { interests } = useLocalSearchParams();
  const userTopics = interests ? JSON.parse(interests as string) : [];
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
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
        await loadTopics();
      } catch (error) {
        console.error('Erro ao carregar dados do usuário ou tópicos:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário ou tópicos');
        setError('Erro ao carregar dados do usuário ou tópicos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.token]);

  const loadTopics = async () => {
    try {
      const response = await fetch('https://api.mazas.org/api/topics');
      const data = await response.json();
      setTopics(data);

      // Mark user's existing topics as selected
      if (userTopics && userTopics.length > 0) {
        // Find the Topic objects that match the user's interests
        const userSelectedTopics = data.filter((topic: Topic) =>
          userTopics.some((userTopic: Topic) => userTopic.id === topic.id || userTopic.documentId === topic.documentId)
        );

        if (userSelectedTopics.length > 0) {
          setSelectedTopics(userSelectedTopics);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
      Alert.alert('Erro', 'Falha ao carregar tópicos');
      setTopics([]);
      setError('Erro ao carregar tópicos');
    }
  };

  const toggleTopic = (topic: Topic): void => {
    setSelectedTopics((prev) =>
      prev.some((t) => t.id === topic.id) ? prev.filter((t) => t.id !== topic.id) : [...prev, topic]
    );
  };

  const handleConfirm = async () => {
    if (!user?.token) {
      Alert.alert('Erro', 'Dados do usuário não encontrados. Por favor, faça login novamente.');
      return;
    }

    if (selectedTopics.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.mazas.org/api/user-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          topics: selectedTopics,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar tópicos');
      }

      router.push('/start/photo');
    } catch (error) {
      console.error('Erro ao salvar tópicos:', error);
      Alert.alert('Erro', 'Falha ao salvar tópicos. Por favor, tente novamente.');
      setError('Erro ao salvar tópicos');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
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
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
