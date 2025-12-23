import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCourseStateAndCertificates } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';

const celebrateImage = require('@/assets/images/celebrate.webp');
const happyImage = require('@/assets/images/happy.webp');
const sadImage = require('@/assets/images/sad.webp');

interface ResultsViewProps {
  correctAnswers: number;
  totalQuestions: number;
  passGrade: number;
  onRetake: () => void;
  grade: number;
  quizCompleted: boolean;
  timeSpent: number;
  timeExpired: boolean;
  isLoading: boolean;
  courseId?: string; // Optional courseId for certificate checking
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  correctAnswers,
  totalQuestions,
  passGrade,
  onRetake,
  grade,
  quizCompleted,
  timeSpent,
  timeExpired,
  isLoading,
  courseId,
}) => {
  const score = (correctAnswers / totalQuestions) * 100;
  const passed = score >= passGrade;
  const formattedTime = formatTime(timeSpent);

  // Get user authentication data
  const { data: user } = useAuthUser();

  // Check course state and certificate availability
  const {
    courseState,
    isCourseFinished,
    shouldFetchCertificates,
    hasCertificate,
    certificates,
    isLoading: certificateLoading,
  } = useCourseStateAndCertificates(courseId || '', user?.token || '');

  // Handler for certificate navigation
  const handleViewCertificate = () => {
    if (hasCertificate && certificates.length > 0) {
      const certificate = certificates.find((cert) => cert.course.documentId === courseId);
      if (certificate) {
        router.push({
          pathname: '/user/certificate',
          params: { certificateId: certificate.documentId },
        });
      }
    }
  };

  const getResultContent = () => {
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
        <View style={styles.globeImageContainer}>
          <Image source={resultContent.image} style={styles.globeImage} />
        </View>

        <Text style={[styles.challengeCompleteTitle, { color: resultContent.cardStyle.titleColor }]}>
          {resultContent.title}
        </Text>

        <Text style={styles.challengeSubtitle}>{resultContent.subtitle}</Text>

        <View style={styles.statsCardsContainer}>
          <View style={[styles.statsCard, styles.pointsCard]}>
            <Text style={styles.statsCardValue}>{grade}</Text>
            <Text style={styles.statsCardLabel}>Pontos</Text>
          </View>

          <View style={[styles.statsCard, styles.correctCard]}>
            <Text style={styles.statsCardValue}>
              {correctAnswers}/{totalQuestions}
            </Text>
            <Text style={styles.statsCardLabel}>Corretas</Text>
          </View>

          <View style={[styles.statsCard, styles.timeCard]}>
            <Text style={styles.statsCardValue}>{formattedTime}</Text>
            <Text style={styles.statsCardLabel}>Tempo</Text>
          </View>
        </View>

        {timeExpired && (
          <View style={styles.timeExpiredBadge}>
            <Feather name="clock" size={20} color="#FF9500" />
            <Text style={styles.timeExpiredText}>Quiz finalizado por tempo</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.claimPointsButton,
            { backgroundColor: resultContent.cardStyle.buttonColor },
            isLoading && styles.claimPointsButtonDisabled,
          ]}
          onPress={() => (passed ? router.back() : onRetake())}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.claimPointsText}>Processando...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.claimPointsText}>{resultContent.buttonText}</Text>
              {passed && (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>{grade}</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>

        {!passed && (
          <TouchableOpacity onPress={() => router.back()}>
            <Text>Continuar</Text>
          </TouchableOpacity>
        )}

        {quizCompleted && (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={20} color="#04D361" />
            <Text style={styles.completedText}>Teste marcado como completo</Text>
          </View>
        )}

        {/* Certificate button - only show if user is logged in, course is finished, and has certificate */}
        {user?.token && hasCertificate && (
          <TouchableOpacity
            style={styles.certificateButton}
            onPress={handleViewCertificate}
            disabled={certificateLoading}
          >
            {certificateLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.certificateButtonText}>Carregando...</Text>
              </View>
            ) : (
              <>
                <Feather name="award" size={20} color="#FFF" />
                <Text style={styles.certificateButtonText}>Ver Certificado</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Debug information - remove in production */}
        {user?.token && courseId && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Estado do curso: {courseState || 'N/A'} | Certificados: {shouldFetchCertificates ? 'Sim' : 'Não'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
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
  claimPointsButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  certificateButton: {
    backgroundColor: '#FFC107',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    gap: 8,
  },
  certificateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(168, 168, 179, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  debugText: {
    color: '#A8A8B3',
    fontSize: 12,
    textAlign: 'center',
  },
});
