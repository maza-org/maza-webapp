import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopicButton from './TopicButton';
import { Topic } from '@/app/types/customize';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface CustomizeContentProps {
  topics: Topic[];
  selectedTopics: Topic[];
  onTopicToggle: (topic: Topic) => void;
}

export default function CustomizeContent({ topics, selectedTopics, onTopicToggle }: CustomizeContentProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    contentHeader: {
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    topicsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
  }), [colors]);

  return (
    <>
      <View style={themedStyles.contentHeader}>
        <Text style={themedStyles.title}>Personalizar a sua experiência</Text>
        <Text style={themedStyles.subtitle}>
          Escolha os temas que mais lhe interessam para que possamos criar uma experiência personalizada
        </Text>
      </View>

      <Text style={themedStyles.sectionTitle}>Escolha os temas do seu interesse</Text>

      <View style={themedStyles.topicsContainer}>
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
