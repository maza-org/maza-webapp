import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface Option {
  id: number;
  description: string;
  comment: string | null;
  is_correct: boolean;
}

interface Question {
  id: number;
  description: string;
  format: string;
  options: Option[];
}

interface QuizModule {
  id: number;
  pass_grade: number;
  questions: Question[];
}

export default function Quiz() {
  const { content } = useLocalSearchParams();
  const quizData: QuizModule = JSON.parse(content as string);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const calculateScore = () => {
    let correctAnswers = 0;
    Object.entries(selectedAnswers).forEach(([questionId, answerId]) => {
      const question = quizData.questions.find((q) => q.id === Number(questionId));
      const selectedOption = question?.options.find((o) => o.id === answerId);
      if (selectedOption?.is_correct) {
        correctAnswers++;
      }
    });
    return (correctAnswers / quizData.questions.length) * 100;
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleFinish = () => {
    const score = calculateScore();
    setShowResults(true);
    if (score >= quizData.pass_grade) {
      Alert.alert('Parabéns!', `Você passou no teste com ${score.toFixed(1)}%`);
    } else {
      Alert.alert('Tente novamente', `Sua pontuação foi ${score.toFixed(1)}%`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teste Final</Text>
        <Text style={styles.questionCounter}>
          {currentQuestion + 1}/{quizData.questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{quizData.questions[currentQuestion].description}</Text>

          <View style={styles.optionsContainer}>
            {quizData.questions[currentQuestion].options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedAnswers[quizData.questions[currentQuestion].id] === option.id && styles.selectedOption,
                  showResults && option.is_correct && styles.correctOption,
                  showResults &&
                    selectedAnswers[quizData.questions[currentQuestion].id] === option.id &&
                    !option.is_correct &&
                    styles.incorrectOption,
                ]}
                onPress={() => handleAnswer(quizData.questions[currentQuestion].id, option.id)}
                disabled={showResults}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswers[quizData.questions[currentQuestion].id] === option.id && styles.selectedOptionText,
                  ]}
                >
                  {option.description}
                </Text>
                {showResults && option.comment && <Text style={styles.commentText}>{option.comment}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {currentQuestion > 0 && !showResults && (
          <TouchableOpacity style={styles.navigationButton} onPress={() => setCurrentQuestion((prev) => prev - 1)}>
            <Text style={styles.navigationButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}

        {currentQuestion < quizData.questions.length - 1 && !showResults && (
          <TouchableOpacity
            style={[styles.navigationButton, styles.nextButton]}
            onPress={() => setCurrentQuestion((prev) => prev + 1)}
          >
            <Text style={styles.navigationButtonText}>Próxima</Text>
          </TouchableOpacity>
        )}

        {currentQuestion === quizData.questions.length - 1 && !showResults && (
          <TouchableOpacity style={[styles.navigationButton, styles.finishButton]} onPress={handleFinish}>
            <Text style={styles.navigationButtonText}>Finalizar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  questionCounter: {
    color: '#A8A8B3',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    padding: 24,
  },
  questionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#323238',
  },
  selectedOption: {
    borderColor: '#1fa2df',
  },
  correctOption: {
    borderColor: '#04D361',
    backgroundColor: 'rgba(4, 211, 97, 0.1)',
  },
  incorrectOption: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  optionText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#1fa2df',
  },
  commentText: {
    color: '#A8A8B3',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
    justifyContent: 'space-between',
  },
  navigationButton: {
    flex: 1,
    backgroundColor: '#323238',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  nextButton: {
    backgroundColor: '#1fa2df',
  },
  finishButton: {
    backgroundColor: '#04D361',
  },
  navigationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
