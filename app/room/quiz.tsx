import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizModule, SelectedAnswersMap } from '@/types/quiz';
import { useMarkQuizAsCompleted, useConcludeModuleQuiz } from '@/services/catalog';
import { User } from '@/types/user';
import { Timer, ResultsView, CommentContainer } from './components';
import { calculateDurationInSeconds } from './utils';

export default function Quiz() {
  const { content, isFinalTest, courseId, userCourseId, moduleId } = useLocalSearchParams();
  const quizData: QuizModule = JSON.parse(content as string);
  const isFinalTestQuiz = isFinalTest === 'true';

  // Calculate quiz duration in seconds based on the duration object
  const QUIZ_DURATION = calculateDurationInSeconds(quizData.duration);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersMap>({});
  const [showResults, setShowResults] = useState(false);
  const [showCurrentFeedback, setShowCurrentFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [calculatedGrade, setCalculatedGrade] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // React Query mutation for marking quiz as completed
  const markQuizAsCompletedMutation = useMarkQuizAsCompleted();
  const concludeModuleQuizMutation = useConcludeModuleQuiz();

  // Helper function to handle quiz completion
  const handleQuizCompletion = async (scorePercentage: number) => {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('@user');
      if (!userData) {
        console.error('No user data found');
        return;
      }

      const user: User = JSON.parse(userData);

      if (isFinalTestQuiz && courseId) {
        // Handle final test quiz
        await markQuizAsCompletedMutation.mutateAsync({
          grade: scorePercentage,
          courseId: courseId as string,
          token: user.token,
        });
      } else if (userCourseId && moduleId) {
        // Handle module quiz
        await concludeModuleQuizMutation.mutateAsync({
          userCourseId: userCourseId as string,
          moduleId: parseInt(moduleId as string),
          grade: scorePercentage,
          token: user.token,
        });
      }

      setQuizCompleted(true);
    } catch (error) {
      console.error('Failed to mark quiz as completed:', error);
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleTimeUp();
          return 0;
        }
        setTimeSpent((prevSpent) => prevSpent + 1);
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Start the timer when the component mounts
    startTimer();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTimeUp = async () => {
    // Set time expired flag
    setTimeExpired(true);

    // Calculate results based on current answers
    const correctAnswersCount = Object.keys(selectedAnswers).filter((questionId) =>
      isAnswerCorrect(Number(questionId))
    ).length;

    const totalQuestions = quizData.questions.length;
    const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    setCalculatedGrade(scorePercentage);

    // Check if user passed the threshold and handle quiz completion
    if (scorePercentage >= quizData.pass_grade && ((isFinalTestQuiz && courseId) || (userCourseId && moduleId))) {
      await handleQuizCompletion(scorePercentage);
    }

    // Show results regardless of pass/fail
    setShowResults(true);

    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const getCurrentQuestion = () => quizData.questions[currentQuestion];

  const getCurrentSelectedAnswers = () => {
    const questionId = getCurrentQuestion().id;
    return selectedAnswers[questionId] || (getCurrentQuestion().format === 'AllThatApply' ? [] : null);
  };

  const isAnswerCorrect = (questionId: number): boolean => {
    const question = quizData.questions.find((q) => q.id === questionId);
    if (!question) return false;

    const selected = selectedAnswers[questionId];

    if (question.format === 'SingleOption') {
      const selectedOption = question.options.find((o) => o.id === selected);
      return selectedOption?.is_correct || false;
    } else {
      const selectedArray = selected as number[];
      const correctOptionIds = question.options.filter((o) => o.is_correct).map((o) => o.id);
      return (
        selectedArray.length === correctOptionIds.length &&
        selectedArray.every((id) => correctOptionIds.includes(id)) &&
        correctOptionIds.every((id) => selectedArray.includes(id))
      );
    }
  };

  const calculateResultsAndFinish = async () => {
    const correctAnswersCount = Object.keys(selectedAnswers).filter((questionId) =>
      isAnswerCorrect(Number(questionId))
    ).length;

    const totalQuestions = quizData.questions.length;
    const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    setCalculatedGrade(scorePercentage);

    // Check if user passed the threshold and handle quiz completion
    if (scorePercentage >= quizData.pass_grade && ((isFinalTestQuiz && courseId) || (userCourseId && moduleId))) {
      await handleQuizCompletion(scorePercentage);
    }

    // Show results regardless of pass/fail
    setShowResults(true);

    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    const question = quizData.questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.format === 'SingleOption') {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));
      setShowCurrentFeedback(true);
    } else {
      setSelectedAnswers((prev) => {
        const currentSelections = (prev[questionId] as number[]) || [];
        const newSelections = currentSelections.includes(optionId)
          ? currentSelections.filter((id) => id !== optionId)
          : [...currentSelections, optionId];

        return {
          ...prev,
          [questionId]: newSelections,
        };
      });
    }
  };

  const handleVerify = () => {
    setShowCurrentFeedback(true);
  };

  const handleNext = () => {
    if (getCurrentQuestion().format === 'AllThatApply' && !showCurrentFeedback) {
      setShowCurrentFeedback(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setShowCurrentFeedback(false);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => prev - 1);
    setShowCurrentFeedback(false);
  };

  const handleFinish = () => {
    if (getCurrentQuestion().format === 'AllThatApply' && !showCurrentFeedback) {
      setShowCurrentFeedback(true);
    } else {
      calculateResultsAndFinish();
    }
  };

  const resetQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowCurrentFeedback(false);
    setTimeLeft(QUIZ_DURATION);
    setTimeSpent(0);
    setCalculatedGrade(0);
    setQuizCompleted(false);
    setTimeExpired(false);
    startTimer();
  };

  const handleRetake = () => {
    resetQuiz();
  };

  const isOptionSelected = (optionId: number) => {
    const currentSelected = getCurrentSelectedAnswers();
    if (Array.isArray(currentSelected)) {
      return currentSelected.includes(optionId);
    }
    return currentSelected === optionId;
  };

  // Calculate if we should show warning (less than 2 minutes left)
  const isTimeWarning = timeLeft <= 120;

  return (
    <SafeAreaView style={styles.container}>
      {!showResults ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Teste Final</Text>
            <Timer timeLeft={timeLeft} isWarning={isTimeWarning} />
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.questionCounter}>
              {currentQuestion + 1}/{quizData.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {currentQuestion + 1}. {getCurrentQuestion().description}
              </Text>

              {getCurrentQuestion().format === 'AllThatApply' && (
                <Text style={styles.AllThatApplySelectHint}>Selecione todas as opções corretas</Text>
              )}

              <View style={styles.optionsContainer}>
                {getCurrentQuestion().options.map((option) => {
                  const isSelected = isOptionSelected(option.id);
                  const showComment = isSelected && option.comment && showCurrentFeedback;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOption,
                        showCurrentFeedback && option.is_correct && styles.correctOption,
                        showCurrentFeedback && isSelected && !option.is_correct && styles.incorrectOption,
                      ]}
                      onPress={() => handleAnswer(getCurrentQuestion().id, option.id)}
                      disabled={getCurrentQuestion().format === 'SingleOption' && showCurrentFeedback}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.checkboxContainer}>
                          <View
                            style={[
                              styles.checkbox,
                              getCurrentQuestion().format === 'AllThatApply' && styles.squareCheckbox,
                              isSelected && styles.checkedCheckbox,
                            ]}
                          >
                            {isSelected && (
                              <Feather
                                name={getCurrentQuestion().format === 'AllThatApply' ? 'check' : 'circle'}
                                size={16}
                                color="#FFF"
                              />
                            )}
                          </View>
                        </View>
                        <View style={styles.optionTextContainer}>
                          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                            {option.description}
                          </Text>
                        </View>

                        {showCurrentFeedback && (
                          <View style={styles.iconContainer}>
                            {option.is_correct ? (
                              <Feather name="check-circle" size={24} color="#04D361" />
                            ) : (
                              isSelected && <Feather name="x-circle" size={24} color="#FF3B30" />
                            )}
                          </View>
                        )}
                      </View>

                      {showComment && <CommentContainer comment={option.comment} isCorrect={option.is_correct} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {getCurrentQuestion().format === 'AllThatApply' && !showCurrentFeedback && (
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    (getCurrentSelectedAnswers() as number[]).length === 0 && styles.verifyButtonDisabled,
                  ]}
                  onPress={handleVerify}
                  disabled={(getCurrentSelectedAnswers() as number[]).length === 0}
                >
                  <Text style={styles.verifyButtonText}>Verificar Resposta</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {currentQuestion > 0 && (
              <TouchableOpacity style={styles.navigationButton} onPress={handlePrevious}>
                <Text style={styles.navigationButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}

            {currentQuestion < quizData.questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.navigationButton, styles.nextButton]}
                onPress={handleNext}
                disabled={
                  getCurrentQuestion().format === 'SingleOption'
                    ? !showCurrentFeedback
                    : !showCurrentFeedback && (getCurrentSelectedAnswers() as number[]).length === 0
                }
              >
                <Text style={styles.navigationButtonText}>Próxima</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navigationButton, styles.finishButton]}
                onPress={handleFinish}
                disabled={
                  getCurrentQuestion().format === 'SingleOption'
                    ? !showCurrentFeedback
                    : !showCurrentFeedback && (getCurrentSelectedAnswers() as number[]).length === 0
                }
              >
                <Text style={styles.navigationButtonText}>Finalizar</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <ResultsView
          correctAnswers={
            Object.keys(selectedAnswers).filter((questionId) => isAnswerCorrect(Number(questionId))).length
          }
          totalQuestions={quizData.questions.length}
          passGrade={quizData.pass_grade}
          onRetake={handleRetake}
          grade={calculatedGrade}
          quizCompleted={quizCompleted}
          timeSpent={QUIZ_DURATION - timeLeft}
          timeExpired={timeExpired}
          isLoading={markQuizAsCompletedMutation.isPending || concludeModuleQuizMutation.isPending}
          courseId={isFinalTestQuiz ? (courseId as string) : undefined}
        />
      )}
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#323238',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 3,
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  optionText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#1fa2df',
  },
  iconContainer: {
    paddingTop: 4,
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
    borderRadius: 50,
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
  retakeButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  retakeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  AllThatApplySelectHint: {
    color: '#A8A8B3',
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#323238',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareCheckbox: {
    borderRadius: 4,
  },
  checkedCheckbox: {
    backgroundColor: '#1fa2df',
    borderColor: '#1fa2df',
  },
  verifyButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
