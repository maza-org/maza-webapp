import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Duration, QuizModule, SelectedAnswersMap, StoredAuthUser } from '@/types/quiz';
import { baseUrl } from '@/services/api';
const celebrateImage = require('@/assets/images/celebrate.webp');
const happyImage = require('@/assets/images/happy.webp');
const sadImage = require('@/assets/images/sad.webp');

const calculateDurationInSeconds = (duration: Duration): number => {
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

// Function to mark quiz as completed
const markQuizAsCompleted = async (grade: number) => {
  try {
    // Get user data from AsyncStorage
    const userData = await AsyncStorage.getItem('@user');
    if (!userData) {
      console.error('No user data found');
      return false;
    }

    const user: StoredAuthUser = JSON.parse(userData);
    const token = user.jwt;
    const response = await fetch(`${baseUrl}/user-courses/vhk8vegd1jbb81hbamg1123h`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          grade: grade,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('Quiz marked as completed:', result);
    return true;
  } catch (error) {
    console.error('Error marking quiz as completed:', error);
    return false;
  }
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
  grade,
  quizCompleted,
  timeSpent,
  timeExpired,
}: {
  correctAnswers: number;
  totalQuestions: number;
  passGrade: number;
  onRetake: () => void;
  grade: number;
  quizCompleted: boolean;
  timeSpent: number;
  timeExpired: boolean;
}) => {
  const score = (correctAnswers / totalQuestions) * 100;
  const passed = score >= passGrade;
  const formattedTime = formatTime(timeSpent);

  // Determine which image and messages to show based on score
  const getResultContent = () => {
    // If time expired, show special message regardless of score
    if (timeExpired) {
      return {
        image: sadImage,
        title: 'Tempo Esgotado!',
        subtitle: 'O tempo para realização do teste acabou. Suas respostas foram enviadas automaticamente.',
        buttonText: score >= passGrade ? 'Reclamar Pontos' : 'Tentar Novamente',
        cardStyle: {
          titleColor: '#FF9500',
          buttonColor: score >= passGrade ? '#1fa2df' : '#FF3B30',
        },
      };
    }

    if (score > passGrade + 10) {
      // Excellent result - celebrate
      return {
        image: celebrateImage,
        title: 'MAZAAA!',
        subtitle:
          'Você absolutamente arrasou neste desafio! Sua excelência é extraordinária. Pronto para conquistar ainda mais?',
        buttonText: 'Reclamar Pontos',
        cardStyle: {
          titleColor: '#04D361',
          buttonColor: '#04D361',
        },
      };
    } else if (score >= passGrade) {
      // Passing grade - happy
      return {
        image: happyImage,
        title: 'Desafio Concluído!',
        subtitle: 'Muito bem! Você conquistou este desafio com confiança. Continue com o excelente trabalho!',
        buttonText: 'Reclamar Pontos',
        cardStyle: {
          titleColor: '#1fa2df',
          buttonColor: '#1fa2df',
        },
      };
    } else {
      // Below passing - sad
      return {
        image: sadImage,
        title: 'Quase lá',
        subtitle: 'Não desista! Cada tentativa te aproxima da maestria. Tente novamente e mostre do que você é capaz!',
        buttonText: 'Tentar Novamente',
        cardStyle: {
          titleColor: '#FF3B30',
          buttonColor: '#FF3B30',
        },
      };
    }
  };

  const resultContent = getResultContent();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.resultsContentContainer}>
        {/* Globe Character Image */}
        <View style={styles.globeImageContainer}>
          <Image source={resultContent.image} style={styles.globeImage} />
        </View>

        {/* Challenge Title */}
        <Text style={[styles.challengeCompleteTitle, { color: resultContent.cardStyle.titleColor }]}>
          {resultContent.title}
        </Text>

        {/* Subtitle */}
        <Text style={styles.challengeSubtitle}>{resultContent.subtitle}</Text>

        {/* Stats Cards */}
        <View style={styles.statsCardsContainer}>
          {/* Points Card */}
          <View style={[styles.statsCard, styles.pointsCard]}>
            <Text style={styles.statsCardValue}>{grade}</Text>
            <Text style={styles.statsCardLabel}>Pontos</Text>
          </View>

          {/* Correct Card */}
          <View style={[styles.statsCard, styles.correctCard]}>
            <Text style={styles.statsCardValue}>
              {correctAnswers}/{totalQuestions}
            </Text>
            <Text style={styles.statsCardLabel}>Corretas</Text>
          </View>

          {/* Time Card */}
          <View style={[styles.statsCard, styles.timeCard]}>
            <Text style={styles.statsCardValue}>{formattedTime}</Text>
            <Text style={styles.statsCardLabel}>Tempo</Text>
          </View>
        </View>

        {/* Time Expired Indicator */}
        {timeExpired && (
          <View style={styles.timeExpiredBadge}>
            <Feather name="clock" size={20} color="#FF9500" />
            <Text style={styles.timeExpiredText}>Quiz finalizado por tempo</Text>
          </View>
        )}

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.claimPointsButton, { backgroundColor: resultContent.cardStyle.buttonColor }]}
          onPress={() => (passed ? router.back() : onRetake())}
        >
          <Text style={styles.claimPointsText}>{resultContent.buttonText}</Text>
          {passed && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>{grade}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Show Continue button if failed (as secondary action) */}
        {!passed && (
          <TouchableOpacity onPress={() => router.back()}>
            <Text>Continuar</Text>
          </TouchableOpacity>
        )}

        {/* Show completion badge if quiz is marked as completed */}
        {quizCompleted && (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={20} color="#04D361" />
            <Text style={styles.completedText}>Quiz marked as completed</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default function Quiz() {
  const { content, isFinalTest } = useLocalSearchParams();
  const quizData: QuizModule = JSON.parse(content as string);

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

    // Check if user passed the threshold
    if (scorePercentage >= quizData.pass_grade) {
      try {
        // Mark the quiz as completed
        const success = await markQuizAsCompleted(scorePercentage);
        if (success) {
          setQuizCompleted(true);
        }
      } catch (error) {
        console.error('Failed to mark quiz as completed:', error);
      }
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

    // Check if user passed the threshold
    if (scorePercentage >= quizData.pass_grade) {
      try {
        // Mark the quiz as completed
        const success = await markQuizAsCompleted(scorePercentage);
        if (success) {
          setQuizCompleted(true);
        }
      } catch (error) {
        console.error('Failed to mark quiz as completed:', error);
      }
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

                      {showComment && (
                        <View
                          style={[
                            styles.commentContainer,
                            option.is_correct ? styles.correctCommentContainer : styles.incorrectCommentContainer,
                          ]}
                        >
                          <View style={styles.commentHeader}>
                            <Feather
                              name={option.is_correct ? 'check-circle' : 'info'}
                              size={16}
                              color={option.is_correct ? '#04D361' : '#1fa2df'}
                            />
                            <Text
                              style={[
                                styles.commentLabel,
                                option.is_correct ? styles.correctCommentLabel : styles.incorrectCommentLabel,
                              ]}
                            >
                              {option.is_correct ? 'Explicação' : 'Por que não é correto'}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.commentText,
                              option.is_correct ? styles.correctCommentText : styles.incorrectCommentText,
                            ]}
                          >
                            {option.comment}
                          </Text>
                        </View>
                      )}
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
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    lineHeight: 20,
    fontStyle: 'italic',
  },
  commentContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(31, 162, 223, 0.08)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1fa2df',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentLabel: {
    color: '#1fa2df',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  correctCommentContainer: {
    backgroundColor: 'rgba(4, 211, 97, 0.08)',
    borderLeftColor: '#04D361',
  },
  incorrectCommentContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderLeftColor: '#FF3B30',
  },
  correctCommentLabel: {
    color: '#04D361',
  },
  incorrectCommentLabel: {
    color: '#FF3B30',
  },
  correctCommentText: {
    color: '#04D361',
    fontWeight: '500',
  },
  incorrectCommentText: {
    color: '#FF3B30',
    fontWeight: '500',
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

  // New styles for the challenge complete screen
  globeImageContainer: {
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  globeImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  challengeCompleteTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  challengeSubtitle: {
    fontSize: 16,
    color: '#A8A8B3',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  statsCard: {
    width: '30%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsCard: {
    backgroundColor: '#FFEEB2',
  },
  correctCard: {
    backgroundColor: '#E3FFEA',
  },
  timeCard: {
    backgroundColor: '#E1F5FF',
  },
  statsCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#121214',
  },
  statsCardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  claimPointsButton: {
    backgroundColor: '#1fa2df',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  claimPointsText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  pointsBadge: {
    backgroundColor: '#FFC107',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  pointsBadgeText: {
    color: '#121214',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 211, 97, 0.1)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 16,
  },
  completedText: {
    color: '#04D361',
    fontSize: 16,
    marginLeft: 8,
  },
  timeExpiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  timeExpiredText: {
    color: '#FF9500',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
});
