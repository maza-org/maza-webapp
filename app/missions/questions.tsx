import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

interface Question {
  id: string;
  questionNumber: string;
  questionText: string;
  answers: Answer[];
  correctFeedback: string;
  incorrectFeedback: string;
}

interface Chapter {
  id: string;
  title: string;
  questions: Question[];
}

// Define interfaces for component props
interface QuestionsProps {
  chapter?: Chapter;
  onExit?: () => void;
  onComplete?: (score: number) => void;
}

// Define interfaces for state
interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
  message: string;
}

export default function Questions({ chapter, onExit, onComplete }: QuestionsProps): React.ReactElement {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    isCorrect: false,
    message: '',
  });

  const slideAnim = useRef<Animated.Value>(new Animated.Value(height)).current;

  const mockChapter: Chapter = {
    id: '1',
    title: 'Capítulo 1: Mudanças Climáticas',
    questions: [
      {
        id: '1',
        questionNumber: 'Pergunta 1',
        questionText: 'O que é o tempo, segundo os conceitos aprendidos?',
        answers: [
          {
            id: 'a1',
            text: 'O conjunto de condições atmosféricas observadas num dia ou momento específico',
            isCorrect: true,
          },
          {
            id: 'a2',
            text: 'O clima característico de uma região durante vários anos',
            isCorrect: false,
          },
          {
            id: 'a3',
            text: 'A previsão de catástrofes naturais',
            isCorrect: false,
          },
          {
            id: 'a4',
            text: 'O período entre o nascer e o pôr do sol',
            isCorrect: false,
          },
        ],
        correctFeedback: 'Certo! O tempo muda ao longo do dia e influencia decisões do dia a dia.',
        incorrectFeedback: 'Errado! Catástrofes podem acontecer por causa do tempo, mas isso não é uma definição.',
      },
    ],
  };

  // Use either provided chapter or mock data
  const currentChapter = chapter || mockChapter;
  const currentQuestion = currentChapter.questions[currentQuestionIndex];

  const showAnswerFeedback = (correct: boolean): void => {
    setFeedback({
      show: true,
      isCorrect: correct,
      message: correct ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback,
    });

    if (correct) {
      setScore((prevScore) => prevScore + 10);
    }

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  };

  const hideCorrectAnswer = (): void => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFeedback((prev) => ({ ...prev, show: false })));
  };

  const goToNextQuestion = (): void => {
    hideCorrectAnswer();

    // Check if we're at the last question
    if (currentQuestionIndex < currentChapter.questions.length - 1) {
      // Move to next question after animation completes
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      }, 350);
    } else {
      // Quiz complete
      setTimeout(() => {
        onComplete && onComplete(score);
      }, 350);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />

      {/* Quiz header with title on top */}
      <View style={styles.quizHeader}>
        <Text style={styles.chapterTitle}>{currentChapter.title}</Text>
      </View>

      {/* Progress bar with points on the right */}
      <View style={styles.progressContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onExit}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050593/maza/coin_xtcp3h.webp' }}
            style={styles.coinIcon}
          />
          <Text style={styles.pointsText}>{score}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>{currentQuestion.questionNumber}</Text>
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
      </View>

      {/* Answer options */}
      <View style={styles.answersContainer}>
        {currentQuestion.answers.map((answer) => (
          <TouchableOpacity
            key={answer.id}
            style={styles.answerOption}
            onPress={() => showAnswerFeedback(answer.isCorrect)}
          >
            <Text style={styles.answerText}>{answer.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom indicator */}
      <View style={styles.bottomIndicatorContainer}>
        <View style={styles.bottomIndicator} />
      </View>

      {/* Overlay and Bottom Sheet */}
      {feedback.show && (
        <>
          {/* Dark overlay behind the bottom sheet */}
          <TouchableWithoutFeedback onPress={hideCorrectAnswer}>
            <Animated.View style={styles.overlay} />
          </TouchableWithoutFeedback>

          {/* Answer Feedback Bottom Sheet */}
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.bottomSheetContent}>
              <Text style={styles.headerText}>{feedback.isCorrect ? 'Resposta Correcta' : 'Resposta Incorrecta'}</Text>

              <View style={styles.feedbackContainer}>
                <Image
                  source={{
                    uri: feedback.isCorrect
                      ? 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746085773/maza/happy_zkwmth.webp'
                      : 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746086306/maza/sad_k2d0w8.png',
                  }}
                  style={styles.icon}
                />
                <Text style={styles.feedbackText}>{feedback.message}</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, !feedback.isCorrect && styles.buttonIncorrect]}
                onPress={goToNextQuestion}
              >
                <Text style={styles.buttonText}>
                  {currentQuestionIndex < currentChapter.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomSheetIndicatorContainer}>
              <View style={styles.bottomSheetIndicator} />
            </View>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarWrapper: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#323238',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  questionNumber: {
    color: '#A8A8B3',
    fontSize: 16,
    marginBottom: 10,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  answersContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  answerOption: {
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#323238',
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomIndicatorContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  bottomIndicator: {
    width: 48,
    height: 5,
    backgroundColor: '#323238',
    borderRadius: 2.5,
  },

  // Bottom Sheet Styles
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121214',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 32,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 36,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    marginRight: 24,
  },
  feedbackText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  button: {
    backgroundColor: '#1fa2df',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 12,
  },
  buttonIncorrect: {
    backgroundColor: '#E83F5B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSheetIndicatorContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  bottomSheetIndicator: {
    width: 48,
    height: 5,
    backgroundColor: '#323238',
    borderRadius: 2.5,
  },
});
