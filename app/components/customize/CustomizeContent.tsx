import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopicButton from './TopicButton';
import { Topic } from '@/app/types/customize';

interface CustomizeContentProps {
  topics: Topic[];
  selectedTopics: Topic[];
  onTopicToggle: (topic: Topic) => void;
}

export default function CustomizeContent({ topics, selectedTopics, onTopicToggle }: CustomizeContentProps) {
  return (
    <>
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
            onPress={() => onTopicToggle(topic)}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
