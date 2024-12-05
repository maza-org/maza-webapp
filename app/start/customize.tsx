import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";

// Types and Interfaces
interface TopicButtonProps extends TouchableOpacityProps {
  topic: string;
  isSelected: boolean;
}

interface StylesType {
  container: ViewStyle;
  scrollView: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  sectionTitle: TextStyle;
  topicsContainer: ViewStyle;
  topicButton: ViewStyle;
  topicButtonSelected: ViewStyle;
  topicText: TextStyle;
  topicTextSelected: TextStyle;
  footer: ViewStyle;
  confirmButton: ViewStyle;
  confirmButtonDisabled: ViewStyle;
  confirmButtonText: TextStyle;
  skipButton: ViewStyle;
  skipButtonText: TextStyle;
}

// Component Types
type Topic = string;

// Subcomponent for Topic Button
function TopicButton({
  topic,
  isSelected,
  onPress,
  ...props
}: TopicButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.topicButton, isSelected && styles.topicButtonSelected]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>
        {topic}
      </Text>
    </TouchableOpacity>
  );
}

export default function Customize(): JSX.Element {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  const topics: Topic[] = [
    "Negócios",
    "Psicologia",
    "Tecnologia",
    "Inteligencia Artificial",
    "Design",
    "Comunicação",
    "Artes",
    "Marketing",
    "Human-Computer Interaction",
    "Criatividade",
    "Inovação",
    "Problem-solving",
    "Idiomas",
  ];

  const toggleTopic = (topic: Topic): void => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleConfirm = (): void => {
    // Handle confirmation logic here
    console.log("Selected topics:", selectedTopics);
  };

  const handleSkip = (): void => {
    // Handle skip logic here
    console.log("Skipped topic selection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Personalizar a sua experiência</Text>
          <Text style={styles.subtitle}>
            Escolha os temas que mais lhe interessam para que possamos criar uma
            experiência personalizada
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Escolha os temas do seu interesse
        </Text>

        <View style={styles.topicsContainer}>
          {topics.map((topic, index) => (
            <TopicButton
              key={`${topic}-${index}`}
              topic={topic}
              isSelected={selectedTopics.includes(topic)}
              onPress={() => toggleTopic(topic)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedTopics.length === 0 && styles.confirmButtonDisabled,
          ]}
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

// StyleSheet with proper typing
const styles = StyleSheet.create<StylesType>({
  container: {
    flex: 1,
    backgroundColor: "#121214",
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
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#A8A8B3",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#202024",
    borderWidth: 1,
    borderColor: "#323238",
  },
  topicButtonSelected: {
    backgroundColor: "#323238",
    borderColor: "#00B37E",
  },
  topicText: {
    color: "#A8A8B3",
    fontSize: 14,
  },
  topicTextSelected: {
    color: "#FFFFFF",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#323238",
  },
  confirmButton: {
    backgroundColor: "#00B37E",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: "#29292E",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    padding: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#A8A8B3",
    fontSize: 16,
  },
});
