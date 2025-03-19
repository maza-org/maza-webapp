import React, { useState, useEffect, useRef } from 'react';
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
  format: 'SingleOption' | 'AllThatApply';
  options: Option[];
}

interface Duration {
  id: number;
  type: 'hours' | 'minutes' | 'seconds';
  value: number;
}

interface QuizModule {
  id: number;
  pass_grade: number;
  questions: Question[];
  duration: Duration;
}

type SelectedAnswers = {
  [key: number]: number | number[];
};

// This function will convert the duration object to seconds
const calculateDurationInSeconds = (duration: Duration): number => {
  // If type is missing but there's a value, default to minutes
  if (!duration.type && duration.value) {
    return duration.value * 60;
  }

  switch (duration.type) {
    case 'hours':
      return duration.value * 60 * 60;
    case 'minutes':
      return duration.value * 60;
    case 'seconds':
      return duration.value;
    default:
      return 10 * 60; // Default to 10 minutes as fallback
  }
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const Timer = ({ timeLeft, isWarning }: { timeLeft: number; isWarning: boolean }) => {
  return (
    <View style={[styles.timerContainer, isWarning && styles.timerWarning]}>
      <Feather name="clock" size={16} color={isWarning ? '#FF3B30' : '#FFF'} />
      <Text style={[styles.timerText, isWarning && styles.timerTextWarning]}>{formatTime(timeLeft)}</Text>
    </View>
  );
};

const ResultsView = ({
  correctAnswers,
  totalQuestions,
  passGrade,
  onRetake,
}: {
  correctAnswers: number;
  totalQuestions: number;
  passGrade: number;
  onRetake: () => void;
}) => {
  const score = (correctAnswers / totalQuestions) * 100;
  const passed = score >= passGrade;
  const earnedPoints = 137; // Este valor pode ser calculado com base na pontuação real

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.resultsContentContainer}>
        <View style={styles.successIconContainer}>
          <View style={[styles.checkCircle, !passed && styles.failCircle]}>
            <Feather name={passed ? 'check' : 'x'} size={48} color="#FFF" />
          </View>
        </View>

        {passed ? (
          <>
            <Text style={styles.congratsTitle}>Muito bem MAZAAA!</Text>

            <Text style={styles.resultDescription}>
              Você absolutamente acertou o{'\n'}
              teste
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.failTitle}>Tente Novamente</Text>
          </>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="check-circle" size={24} color="#04D361" />
              </View>
              <Text style={styles.statLabel}>Questões Corretas</Text>
              <Text style={styles.statValue}>{correctAnswers}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="x-circle" size={24} color="#FF3B30" />
              </View>
              <Text style={styles.statLabel}>Questões Incorretas</Text>
              <Text style={styles.statValue}>{totalQuestions - correctAnswers}</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.totalLabel}>Total de Questões</Text>
            <Text style={styles.totalValue}>{totalQuestions}</Text>
          </View>
        </View>

        <View style={styles.resultsButtonContainer}>
          {!passed && (
            <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
              <Text style={styles.retakeButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.continueButton, !passed && styles.continueButtonSecondary]}
            onPress={() => router.back()}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default function Quiz() {
  const { content } = useLocalSearchParams();
  const quizData: QuizModule = JSON.parse(content as string);

  // Calculate quiz duration in seconds based on the duration object
  const QUIZ_DURATION = calculateDurationInSeconds(quizData.duration);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [showCurrentFeedback, setShowCurrentFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start the timer when the component mounts
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          clearInterval(timerRef.current as NodeJS.Timeout);
          // Auto-submit the quiz
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTimeUp = () => {
    Alert.alert('Tempo Esgotado!', 'O tempo para realização do teste acabou.', [
      {
        text: 'OK',
        onPress: () => setShowResults(true),
      },
    ]);
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
      const selectedCorrectly =
        selectedArray.length === correctOptionIds.length &&
        selectedArray.every((id) => correctOptionIds.includes(id)) &&
        correctOptionIds.every((id) => selectedArray.includes(id));
      return selectedCorrectly;
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
      setShowResults(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowCurrentFeedback(false);
    setTimeLeft(QUIZ_DURATION);

    // Restart the timer
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
        return prev - 1;
      });
    }, 1000);
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

                      {showComment && <Text style={styles.commentText}>{option.comment}</Text>}
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
  resultsContentContainer: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 60,
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
  commentText: {
    color: '#A8A8B3',
    fontSize: 14,
    marginTop: 8,
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
  resultsButtonContainer: {
    marginTop: 24,
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonSecondary: {
    backgroundColor: '#323238',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#323238',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  timerWarning: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  timerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  timerTextWarning: {
    color: '#FF3B30',
  },
  // Novos estilos para tela de resultados
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1fa2df',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  failCircle: {
    backgroundColor: '#FF3B30',
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  failTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pointsLabel: {
    fontSize: 18,
    color: '#A8A8B3',
    marginBottom: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsValue: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#1fa2df',
    marginRight: 8,
  },
  failPointsValue: {
    color: '#FF3B30',
  },
  trophyContainer: {
    marginTop: 8,
  },
  pointsUsage: {
    fontSize: 18,
    color: '#A8A8B3',
  },
  statsContainer: {
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    color: '#A8A8B3',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalLabel: {
    color: '#A8A8B3',
    fontSize: 16,
    marginBottom: 4,
  },
  totalValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
