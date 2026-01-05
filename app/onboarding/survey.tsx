import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { useSurveyQuestions, useSubmitSurvey } from '@/services/survey';
import { useAuthUser } from '@/hooks/useAuth';
import { SurveyAnswer } from '@/types/survey';
import { setOnboardingComplete } from '@/util/onboarding';
import { useTheme } from '@/contexts/ThemeContext';

export default function SurveyOnboardingScreen() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
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
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        progressBarContainer: {
          flex: 1,
          justifyContent: 'center',
        },
        progressBarBackground: {
          height: 7.2,
          borderRadius: 3.6,
          overflow: 'hidden',
          backgroundColor: isDark ? '#29292E' : '#E1E1E6',
        },
        progressBarFill: {
          height: 7.2,
          borderRadius: 3.6,
          backgroundColor: colors.tint,
        },
        progressText: {
          fontSize: 12,
          opacity: 0.6,
          minWidth: 50,
          textAlign: 'center',
          color: colors.text,
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
          color: colors.text,
        },
        answersContainer: {
          gap: 12,
        },
        answerOption: {
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderRadius: 16,
          borderWidth: 1,
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
        answerOptionSelected: {
          backgroundColor: colors.tint,
          borderColor: colors.tint,
        },
        answerText: {
          fontSize: 16,
          fontWeight: '500',
          color: colors.text,
        },
        answerTextSelected: {
          color: '#FFFFFF',
        },
        footer: {
          paddingHorizontal: 20,
          paddingVertical: 20,
        },
        loadingText: {
          marginTop: 16,
          fontSize: 16,
          color: colors.text,
        },
        errorTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: 16,
          marginBottom: 8,
          color: colors.text,
        },
        errorMessage: {
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 24,
          color: colors.text,
          opacity: 0.7,
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
          color: colors.text,
        },
        successMessage: {
          fontSize: 16,
          textAlign: 'center',
          opacity: 0.7,
          lineHeight: 24,
          marginBottom: 48,
          color: colors.text,
        },
        successButtonContainer: {
          width: '100%',
        },
      }),
    [colors, isDark]
  );

  const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>();
  const isFromProfile = fromProfile === 'true';
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: questionsData, isLoading, error } = useSurveyQuestions();
  const { data: authUser } = useAuthUser();
  const submitSurveyMutation = useSubmitSurvey();

  const questions = questionsData?.data || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex + 1) / totalQuestions : 0;

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

    const surveyData: SurveyAnswer[] = Object.entries(selectedAnswers).map(
      ([questionDocId, answerDocId]) => ({
        question: questionDocId,
        answer: answerDocId,
      })
    );

    try {
      await submitSurveyMutation.mutateAsync({
        token: authUser.token,
        answers: { data: surveyData },
      });

      // Save the onboarding completion flag only if this is the initial onboarding
      if (!isFromProfile) {
        await setOnboardingComplete();
      }

      // Show success screen
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      Alert.alert(
        'Erro',
        error.message || 'Falha ao enviar o questionário. Por favor, tente novamente.'
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={themedStyles.loadingText}>A carregar perguntas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={themedStyles.errorTitle}>Erro ao carregar</Text>
          <Text style={themedStyles.errorMessage}>
            Não foi possível carregar as perguntas. Por favor, tente novamente.
          </Text>
          <Button handle={() => router.back()} text="Voltar" />
        </View>
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.centerContainer}>
          <Text style={themedStyles.errorTitle}>Nenhuma pergunta disponível</Text>
          <Button handle={() => router.back()} text="Voltar" />
        </View>
      </SafeAreaView>
    );
  }

  if (showSuccess) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.successContainer}>
          <View style={themedStyles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={120} color={colors.tint} />
          </View>

          <Text style={themedStyles.successTitle}>
            {isFromProfile ? 'Preferências Actualizadas!' : 'Questionário Concluído!'}
          </Text>

          <Text style={themedStyles.successMessage}>
            {isFromProfile
              ? 'Suas preferências foram actualizadas com sucesso. A sua experiência será personalizada de acordo.'
              : 'Obrigado por partilhar suas preferências. Vamos personalizar sua experiência de aprendizagem.'}
          </Text>

          <View style={themedStyles.successButtonContainer}>
            <Button
              handle={() => {
                if (isFromProfile) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }}
              text={isFromProfile ? 'Voltar ao Perfil' : 'Começar a aprender'}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header with back button and progress */}
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={handleBack} style={themedStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={themedStyles.progressBarContainer}>
          <View style={themedStyles.progressBarBackground}>
            <View
              style={[themedStyles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        {/* Progress Text */}
        <Text style={themedStyles.progressText}>
          {currentQuestionIndex + 1} de {totalQuestions}
        </Text>
      </View>

      {/* Question and Answers */}
      <ScrollView style={themedStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={themedStyles.questionTitle}>{currentQuestion.question}</Text>

        <View style={themedStyles.answersContainer}>
          {currentQuestion.survey_answer_options.map((option) => {
            const isSelected = selectedAnswers[currentQuestion.documentId] === option.documentId;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  themedStyles.answerOption,
                  isSelected && themedStyles.answerOptionSelected,
                ]}
                onPress={() => handleSelectAnswer(currentQuestion.documentId, option.documentId)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    themedStyles.answerText,
                    isSelected && themedStyles.answerTextSelected,
                  ]}
                >
                  {option.answer}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={themedStyles.footer}>
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
