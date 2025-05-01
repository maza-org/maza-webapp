import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function Questions() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const showAnswerFeedback = (correct) => {
    setIsCorrect(correct);
    setShowAnswer(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  };

  const hideCorrectAnswer = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowAnswer(false));
  };

  const goToNextQuestion = () => {
    hideCorrectAnswer();
    // Logic to go to next question would be added here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />

      {/* Quiz header with title on top */}
      <View style={styles.quizHeader}>
        <Text style={styles.chapterTitle}>Chapter 1: Mudanças Climáticas</Text>
      </View>

      {/* Progress bar with points on the right */}
      <View style={styles.progressContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="x" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050593/maza/coin_xtcp3h.webp' }}
            style={styles.coinIcon}
          />
          <Text style={styles.pointsText}>10</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Pergunta 1</Text>
        <Text style={styles.questionText}>O que é o tempo, segundo os conceitos aprendidos?</Text>
      </View>

      {/* Answer options */}
      <View style={styles.answersContainer}>
        <TouchableOpacity style={styles.answerOption} onPress={() => showAnswerFeedback(true)}>
          <Text style={styles.answerText}>
            O conjunto de condições atmosféricas observadas num dia ou momento específico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.answerOption} onPress={() => showAnswerFeedback(false)}>
          <Text style={styles.answerText}>O clima característico de uma região durante vários anos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.answerOption} onPress={() => showAnswerFeedback(false)}>
          <Text style={styles.answerText}>A previsão de catástrofes naturais</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.answerOption} onPress={() => showAnswerFeedback(false)}>
          <Text style={styles.answerText}>O período entre o nascer e o pôr do sol</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom indicator */}
      <View style={styles.bottomIndicatorContainer}>
        <View style={styles.bottomIndicator} />
      </View>

      {/* Overlay and Bottom Sheet */}
      {showAnswer && (
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
              <Text style={styles.headerText}>{isCorrect ? 'Resposta Correcta' : 'Resposta Incorrecta'}</Text>

              <View style={styles.feedbackContainer}>
                <Image
                  source={{
                    uri: isCorrect
                      ? 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746085773/maza/happy_zkwmth.webp'
                      : 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746086306/maza/sad_k2d0w8.png',
                  }}
                  style={styles.icon}
                />
                <Text style={styles.feedbackText}>
                  {isCorrect
                    ? 'Certo! O tempo muda ao longo do dia e influencia decisões do dia a dia.'
                    : 'Errado! Catástrofes podem acontecer por causa do tempo, mas isso não é uma definição.'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, !isCorrect && styles.buttonIncorrect]}
                onPress={goToNextQuestion}
              >
                <Text style={styles.buttonText}>Próxima Questão</Text>
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
    marginRight: 10,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    backgroundColor: '#E83F5B', // Red color for incorrect answers
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
