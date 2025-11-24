import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { useSurveyQuestions, useSubmitSurvey } from '@/services/survey';
import { useAuthUser } from '@/hooks/useAuth';
import { SurveyQuestion, SurveyAnswer } from '@/types/survey';
import { setOnboardingComplete } from '@/util/onboarding';

const theme = Colors['dark'];

export default function SurveyOnboardingScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch questions
  const { data: questionsData, isLoading, error } = useSurveyQuestions();
  const { data: authUser } = useAuthUser();
  const submitSurveyMutation = useSubmitSurvey();

  const questions = questionsData?.data || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex + 1) / totalQuestions : 0;

  // Check if current question has been answered
  const hasAnswer = currentQuestion ? !!selectedAnswers[currentQuestion.documentId] : false;

  const handleSelectAnswer = (questionDocId: string, answerDocId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionDocId]: answerDocId,
    }));
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  };

  const handleContinue = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - submit survey
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!authUser?.token) {
      Alert.alert('Erro', 'Por favor, faça login para enviar o questionário.');
      return;
    }

    // Transform answers to API format
    const surveyData: SurveyAnswer[] = Object.entries(selectedAnswers).map(([questionDocId, answerDocId]) => ({
      question: questionDocId,
      answer: answerDocId,
    }));

    try {
      await submitSurveyMutation.mutateAsync({
        token: authUser.token,
        answers: { data: surveyData },
      });

      // Save the onboarding completion flag
      await setOnboardingComplete();

      // Show success screen
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      Alert.alert('Erro', error.message || 'Falha ao enviar o questionário. Por favor, tente novamente.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.text }]}>A carregar perguntas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Erro ao carregar</Text>
          <Text style={[styles.errorMessage, { color: theme.text, opacity: 0.7 }]}>
            Não foi possível carregar as perguntas. Por favor, tente novamente.
          </Text>
          <Button handle={() => router.back()} text="Voltar" />
        </View>
      </SafeAreaView>
    );
  }

  // No questions available
  if (!questions.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, { color: theme.text }]}>Nenhuma pergunta disponível</Text>
          <Button handle={() => router.back()} text="Voltar" />
        </View>
      </SafeAreaView>
    );
  }

  // Success screen
  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={120} color="#22ACE3" />
          </View>

          <Text style={[styles.successTitle, { color: theme.text }]}>Questionário Concluído!</Text>

          <Text style={[styles.successMessage, { color: theme.text }]}>
            Obrigado por partilhar suas preferências. Vamos personalizar sua experiência de aprendizagem.
          </Text>

          <View style={styles.successButtonContainer}>
            <Button handle={() => router.replace('/(tabs)')} text="Começar a aprender" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with back button and progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: '#22ACE3' }]} />
          </View>
        </View>

        {/* Progress Text */}
        <Text style={[styles.progressText, { color: theme.text }]}>
          {currentQuestionIndex + 1} de {totalQuestions}
        </Text>
      </View>

      {/* Question and Answers */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.questionTitle, { color: theme.text }]}>{currentQuestion.question}</Text>

        <View style={styles.answersContainer}>
          {currentQuestion.survey_answer_options.map((option) => {
            const isSelected = selectedAnswers[currentQuestion.documentId] === option.documentId;

            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.answerOption, isSelected && styles.answerOptionSelected]}
                onPress={() => handleSelectAnswer(currentQuestion.documentId, option.documentId)}
                activeOpacity={0.7}
              >
                <Text style={[styles.answerText, { color: isSelected ? '#000000' : '#FFFFFF' }]}>{option.answer}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          handle={handleContinue}
          text={currentQuestionIndex === totalQuestions - 1 ? 'Concluir' : 'Continuar'}
          disabled={!hasAnswer}
          loading={submitSurveyMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 7.2,
    backgroundColor: '#1F1F1F',
    borderRadius: 3.6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 7.2,
    borderRadius: 3.6,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
    minWidth: 50,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 32,
  },
  answersContainer: {
    gap: 12,
  },
  answerOption: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  answerOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: 48,
  },
  successButtonContainer: {
    width: '100%',
  },
});
