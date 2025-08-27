import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Reviews from '@/components/Reviews';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Module, Quiz } from '@/types/learning';
import { LevelBadge } from '@/components/LevelBadge';
import { Tab } from '@/components/Tab';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import {
  useCourseDetails,
  useCertificates,
  useAddToFavorites,
  useRemoveFromFavorites,
  useIsFavorite,
  useStartCourse,
  useCourseProgress,
} from '@/services/catalog';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthUser } from '@/hooks/useAuth';

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'opinions'>('lessons');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { toast, config, showSuccess, showError, showInfo, hideToast } = useToast();

  const { documentId } = useLocalSearchParams<{ documentId: string }>();

  // Token change detection and query client
  const previousTokenRef = useRef<string | undefined>(undefined);
  const queryClient = useQueryClient();

  // React Query hooks
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
    refetch: refetchCourse,
  } = useCourseDetails(documentId);
  const { data: certificates = [], isLoading: certificatesLoading, error: certificatesError } = useCertificates();
  const { data: user, isLoading: userLoading } = useAuthUser();
  const { isInProgress, isLoading: progressLoading } = useCourseProgress(documentId, user?.token || '');
  const { isFavorite, isLoading: favoriteLoading } = useIsFavorite(documentId, user?.token || '');

  // Loading states
  const isLoading = courseLoading || userLoading || (!!user?.token && progressLoading);
  const isRefreshing = courseLoading || certificatesLoading;
  const isUserDataRefreshing = userLoading || (!!user?.token && (progressLoading || favoriteLoading));

  // Check for token changes and refresh data
  useEffect(() => {
    const currentToken = user?.token;
    const previousToken = previousTokenRef.current;

    if (currentToken !== previousToken) {
      console.log('Token changed:', { previousToken: !!previousToken, currentToken: !!currentToken });

      // Update the ref
      previousTokenRef.current = currentToken;

      // If we now have a token (user logged in), refresh user-dependent data
      if (currentToken && !previousToken) {
        console.log('User logged in, refreshing user data...');
        showSuccess('Bem-vindo de volta! Carregando seus dados...');
        // Invalidate and refetch user-dependent queries
        queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
        queryClient.invalidateQueries({ queryKey: ['user-courses'] });
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
      }
    }
  }, [user?.token, queryClient, showSuccess]);

  // Show success message when user data finishes loading after login
  useEffect(() => {
    if (user?.token && !isUserDataRefreshing && !userLoading) {
      // Check if this is the first time we have user data loaded
      const hasJustLoaded = previousTokenRef.current === user.token && !userLoading;
      if (hasJustLoaded) {
        console.log('User data loaded successfully');
        // Don't show another success message here to avoid spam
      }
    }
  }, [user?.token, isUserDataRefreshing, userLoading]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, checking for token updates...');
      // Refetch auth user data to check for token updates
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    }, [queryClient])
  );

  // Mutations
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const startCourseMutation = useStartCourse();

  // Debug logging
  console.log('Loading states:', {
    courseLoading,
    userLoading,
    progressLoading,
    favoriteLoading,
    userToken: !!user?.token,
    isLoading,
    documentId,
  });

  // Check if certificate exists for this course and no errors
  const hasCertificate =
    !certificatesError && certificates.length > 0 && certificates.some((cert) => cert.course.documentId === documentId);

  // Debug certificate state
  console.log('Certificate state:', {
    certificatesError,
    certificatesCount: certificates.length,
    hasCertificate,
    documentId,
    certificates: certificates.map((cert) => ({
      courseId: cert.course.documentId,
      certificateId: cert.documentId,
    })),
  });

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    switch (option) {
      case 'certificate':
        // Since we only show this option when certificate exists, we can safely find it
        const certificate = certificates.find((cert) => cert.course.documentId === documentId);
        router.push({
          pathname: '/user/certificate',
          params: { certificateId: certificate!.documentId },
        });
        break;
      case 'report':
        showInfo('Funcionalidade de reportar problema em desenvolvimento');
        // Implement report bug functionality here
        break;
      default:
        break;
    }
    setMenuVisible(false);
  };

  const handleFavorite = async () => {
    if (!user?.token) {
      showError('Para marcar um curso como favorito é necessário que tenha feito o login');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await removeFromFavoritesMutation.mutateAsync({
          courseId: documentId,
          token: user.token,
        });
        showSuccess('Curso removido dos favoritos!');
      } else {
        // Add to favorites
        await addToFavoritesMutation.mutateAsync({
          courseId: documentId,
          token: user.token,
        });
        showSuccess('Curso adicionado aos favoritos!');
      }

      // Force refetch the favorites data to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    } catch (error) {
      console.error('Erro ao gerenciar favoritos:', error);
      showError('Falha ao gerenciar favoritos');
    }
  };

  const handleStartCourse = async () => {
    if (!user?.token) {
      showError('Para iniciar um curso é necessário que tenha feito o login');
      return;
    }

    try {
      await startCourseMutation.mutateAsync({
        courseId: documentId,
        token: user.token,
      });
      router.push(`/path?courseId=${documentId}`);
    } catch (error) {
      console.error('Erro ao iniciar curso:', error);
      showError('Falha ao iniciar o curso');
    }
  };

  // Toggle description expand/collapse
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchCourse();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (courseError) {
    console.error('Course error:', courseError);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar dados do curso</Text>
        <Text style={[styles.errorText, { fontSize: 12, marginTop: 8 }]}>
          {courseError.message || 'Erro desconhecido'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar curso</Text>
      </View>
    );
  }

  function handlePlayModule(module: Module) {
    router.push({
      pathname: '/room/watch',
      params: {
        module: JSON.stringify(module),
        author: courseData?.author,
        title: courseData?.title,
        imageUrl: courseData?.cover?.formats?.thumbnail?.url,
      },
    });
  }

  function handleStartQuiz(content: Quiz, isFinalTest = false) {
    const params: {
      content: string;
      isFinalTest?: string | undefined;
    } = {
      content: JSON.stringify(content),
      isFinalTest: undefined,
    };

    if (isFinalTest) {
      params.isFinalTest = JSON.stringify(true);
    }

    router.push({
      pathname: '/room/quiz',
      params: params,
    });
  }

  function handleOnPathPress() {
    router.push({
      pathname: '/missions',
      params: {
        course: JSON.stringify(courseData),
      },
    });
  }

  // Helper function to convert Portuguese level to English
  const getEnglishLevel = (portugueseLevel: string): 'Basic' | 'Intermediate' | 'Advanced' => {
    switch (portugueseLevel) {
      case 'Básico':
        return 'Basic';
      case 'Intermédio':
      case 'Intermediário':
        return 'Intermediate';
      case 'Avançado':
        return 'Advanced';
      default:
        return 'Intermediate';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
      />
      <ScrollView
        style={styles.scrollView}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2EA8FF"
            colors={['#2EA8FF']}
          />
        }
      >
        <ImageBackground source={{ uri: courseData?.cover?.formats?.thumbnail?.url }} style={styles.header}>
          <View style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Feather name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.rightActions}>
                {isUserDataRefreshing && (
                  <View style={styles.refreshIndicator}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                )}
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="share" size={24} color="#FFF" />
                </TouchableOpacity>
                {user?.token && (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      (addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending || favoriteLoading) &&
                        styles.iconButtonDisabled,
                    ]}
                    onPress={handleFavorite}
                    disabled={
                      addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending || favoriteLoading
                    }
                  >
                    {addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending || favoriteLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite ? '#FF4B4B' : '#FFF'}
                      />
                    )}
                  </TouchableOpacity>
                )}
                {hasCertificate && (
                  <View>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                      <Entypo name="dots-three-horizontal" size={24} color="#fff" />
                    </TouchableOpacity>

                    {menuVisible && (
                      <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('certificate')}>
                          <Text style={styles.menuItemText}>Certificado</Text>
                        </TouchableOpacity>

                        {/*<TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('report')}>*/}
                        {/*  <Text style={styles.menuItemText}>Reportar Problema</Text>*/}
                        {/*</TouchableOpacity>*/}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Level Badge Component */}
            <LevelBadge level={getEnglishLevel(courseData?.level || 'Intermédio')} />
          </View>
        </ImageBackground>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{courseData.title}</Text>
          <View style={styles.instructor}>
            <Text style={styles.instructorName}>{courseData.author}</Text>
            <Text style={styles.categoryTag}>• {courseData.subjects[0]?.name || ''}</Text>
            <TouchableOpacity style={styles.pathButton} onPress={handleOnPathPress}>
              <AntDesign name="fork" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Course Description Section */}
          {courseData.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText} numberOfLines={showFullDescription ? undefined : 3}>
                {courseData.description}
              </Text>
              <TouchableOpacity onPress={toggleDescription} style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>{showFullDescription ? 'Ver menos' : 'Ver mais'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tabContainer}>
            <Tab active={activeTab === 'lessons'} onPress={() => setActiveTab('lessons')}>
              Aulas
            </Tab>
            <Tab active={activeTab === 'opinions'} onPress={() => setActiveTab('opinions')}>
              Opiniões
            </Tab>
          </View>
        </View>

        {activeTab === 'lessons' ? (
          <View style={styles.modulesList}>
            {!courseData.modules || courseData.modules.length === 0 ? (
              <View style={styles.noModulesContainer}>
                <Feather name="book-open" size={48} color="#A8A8B3" style={styles.noModulesIcon} />
                <Text style={styles.noModulesText}>Nenhum módulo encontrado para este curso</Text>
              </View>
            ) : (
              <>
                {courseData.modules.map((module, index) => (
                  <TouchableOpacity key={module.id} style={styles.moduleItem} onPress={() => handlePlayModule(module)}>
                    <View style={styles.moduleContent}>
                      <View style={styles.moduleTopRow}>
                        <View style={styles.moduleInfo}>
                          <Text style={styles.moduleNumber}>{index + 1}.</Text>
                          <Text style={styles.moduleTitle}>{module.title}</Text>
                        </View>
                        <View style={styles.moduleDetails}>
                          <View style={styles.iconContainer}>
                            <Ionicons name="play" size={20} color="#4db5ff" />
                          </View>
                        </View>
                      </View>
                      <View style={styles.videoCount}>
                        <Feather name="film" size={14} color="#A8A8B3" />
                        <Text style={styles.videoCountText}>{module.contents.length} videos</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                {courseData.final_test && (
                  <TouchableOpacity
                    style={styles.moduleItem}
                    onPress={() => handleStartQuiz(courseData.final_test, true)}
                  >
                    <View style={styles.moduleContent}>
                      <View style={styles.moduleTopRow}>
                        <View style={styles.moduleInfo}>
                          <Text style={styles.moduleNumber}>Q.</Text>
                          <Text style={styles.moduleTitle}>Teste Final</Text>
                        </View>
                        <View style={styles.moduleDetails}>
                          <View style={styles.iconContainer}>
                            <Ionicons name="help-circle" size={20} color="#4db5ff" />
                          </View>
                        </View>
                      </View>
                      <View style={styles.videoCount}>
                        <Feather name="check-circle" size={14} color="#A8A8B3" />
                        <Text style={styles.videoCountText}>{courseData.final_test.questions.length} perguntas</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.opinionsContainer}>
            <View style={styles.ratingOverview}>
              <Reviews courseId={documentId} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            startCourseMutation.isPending && styles.startButtonDisabled,
            isInProgress && styles.continueButton,
          ]}
          onPress={handleStartCourse}
          disabled={startCourseMutation.isPending}
        >
          {startCourseMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.startButtonText, isInProgress && styles.continueButton]}>
              {isInProgress ? 'Continuar' : 'Iniciar Curso'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
    padding: 24,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1fa2df',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 200,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 45,
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  courseInfo: {
    padding: 24,
    backgroundColor: '#121214',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorName: {
    color: '#FFF',
    fontSize: 14,
  },
  categoryTag: {
    color: '#1fa2df',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
  },
  pathButton: {
    backgroundColor: '#1fa2df',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  pathButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 16,
    borderRadius: 8,
  },
  descriptionText: {
    color: '#E1E1E6',
    fontSize: 14,
    lineHeight: 22,
  },
  viewMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  viewMoreText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  modulesList: {
    padding: 24,
  },
  moduleItem: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleContent: {
    gap: 12,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  moduleNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  moduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#2a2d3e',
    borderRadius: 50,
    padding: 5,
  },
  videoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginStart: 25,
  },
  videoCountText: {
    color: '#A8A8B3',
    fontSize: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  startButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1fa2df80',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  opinionsContainer: {},
  ratingOverview: {
    marginBottom: 24,
  },
  noModulesContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202024',
    borderRadius: 15,
    marginVertical: 12,
  },
  noModulesText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  noModulesIcon: {
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#1fa2df',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  refreshIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
