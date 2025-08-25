import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Picture } from '@/types/course';
import { useUserFavorites, useRemoveFromFavorites, useStartCourse } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  picture: Picture;
  cover: Picture;
}

interface FavoriteCourse {
  id: number;
  documentId: string;
  position: string;
  is_favorite: boolean;
  progress: number;
  course: Course;
}

interface FavoriteResponse {
  data: FavoriteCourse[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 16px padding on each side + 16px gap

const FavoriteCoursesGrid = () => {
  const { data: user } = useAuthUser();
  const { data: favoritesResponse, isLoading, error, refetch } = useUserFavorites(user?.token || '');
  const removeFromFavorites = useRemoveFromFavorites();
  const startCourse = useStartCourse();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { toast, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: viewMode === 'grid' ? 0 : 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [viewMode, animatedValue]);

  const handleRemoveFromFavorites = (courseId: string, courseTitle: string) => {
    Alert.alert('Remover dos Favoritos', `Tem certeza que deseja remover "${courseTitle}" dos seus favoritos?`, [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          removeFromFavorites.mutate(
            { courseId, token: user?.token || '' },
            {
              onSuccess: () => {
                showSuccess('Curso removido dos favoritos!');
              },
              onError: (error) => {
                showError('Falha ao remover dos favoritos');
              },
            }
          );
        },
      },
    ]);
  };

  const handleStartCourse = (courseId: string, courseTitle: string) => {
    setSelectedCourseId(courseId);
    startCourse.mutate(
      { courseId, token: user?.token || '' },
      {
        onSuccess: () => {
          setSelectedCourseId(null);
          router.push({
            pathname: '/room/lessons',
            params: { documentId: courseId },
          });
        },
        onError: (error) => {
          setSelectedCourseId(null);
          showError('Falha ao iniciar o curso');
        },
      }
    );
  };

  const handleCoursePress = (courseId: string) => {
    router.push({
      pathname: '/room/lessons',
      params: { documentId: courseId },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
        <Text style={styles.loadingText}>Carregando seus favoritos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF4B4B" />
        </View>
        <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
        <Text style={styles.errorSubtitle}>Não foi possível carregar os seus favoritos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const favorites = favoritesResponse?.data || [];

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-outline" size={80} color="#8F8F8F" />
        </View>
        <Text style={styles.emptyTitle}>Nenhum curso favorito</Text>
        <Text style={styles.emptySubtitle}>Adicione cursos aos favoritos para acessá-los rapidamente aqui</Text>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/categories')}>
          <Text style={styles.exploreButtonText}>Explorar Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.toolbar}>
        <View style={styles.viewToggle}>
          <Animated.View
            style={[
              styles.animatedBackground,
              {
                transform: [
                  {
                    translateX: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 46],
                    }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver em grade"
            style={styles.toggleButton}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#0B1727' : '#B0B0B0'} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver em lista"
            style={styles.toggleButton}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#0B1727' : '#B0B0B0'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.gridContainer, viewMode === 'list' && styles.listContainer]}>
        {favorites.map((favorite: FavoriteCourse) => (
          <TouchableOpacity
            key={favorite.id}
            style={[styles.courseCard, viewMode === 'list' && styles.listCard]}
            onPress={() => handleCoursePress(favorite.course.documentId)}
            activeOpacity={0.8}
          >
            {/* Course Image with Overlay */}
            <View style={[styles.imageContainer, viewMode === 'list' && styles.listImageContainer]}>
              <Image
                source={{
                  uri:
                    favorite.course.picture?.formats?.thumbnail?.url ||
                    favorite.course.picture?.formats?.small?.url ||
                    favorite.course.picture?.url,
                }}
                style={[styles.courseImage, viewMode === 'list' && styles.listCourseImage]}
              />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.imageOverlay} />

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFromFavorites(favorite.course.documentId, favorite.course.title);
                  }}
                  disabled={removeFromFavorites.isPending}
                >
                  {removeFromFavorites.isPending ? (
                    <ActivityIndicator size="small" color="#FF4B4B" />
                  ) : (
                    <Ionicons name="heart" size={16} color="#FF4B4B" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${favorite.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{favorite.progress}%</Text>
              </View>
            </View>

            {/* Course Content */}
            <View style={[styles.contentContainer, viewMode === 'list' && styles.listContentContainer]}>
              {/* Status Badge */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    favorite.progress === 0 ? styles.notStartedBadge : styles.inProgressBadge,
                  ]}
                >
                  <Text style={[styles.statusText, { color: favorite.progress === 0 ? '#2EA8FF' : '#FFC107' }]}>
                    {favorite.progress === 0 ? 'Não iniciado' : 'Em progresso'}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title} numberOfLines={2}>
                {favorite.course.title}
              </Text>

              {/* Author */}
              <View style={styles.instructorContainer}>
                <Image
                  source={{ uri: favorite.course.cover?.formats?.thumbnail?.url }}
                  style={styles.instructorAvatar}
                />
                <Text style={styles.instructorName} numberOfLines={1}>
                  {favorite.course.author}
                </Text>
              </View>

              {/* Footer */}
              <View style={[styles.footer, viewMode === 'list' && styles.listFooter]}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStartCourse(favorite.course.documentId, favorite.course.title);
                  }}
                  disabled={startCourse.isPending && selectedCourseId === favorite.course.documentId}
                >
                  {startCourse.isPending && selectedCourseId === favorite.course.documentId ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.startButtonText}>{favorite.progress > 0 ? 'Continuar' : 'Iniciar'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} position="top" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#8F8F8F',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  listContainer: {
    flexDirection: 'column',
  },
  courseCard: {
    width: cardWidth,
    backgroundColor: '#202024',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  listCard: {
    width: '100%',
    flexDirection: 'row',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  listImageContainer: {
    width: 120,
    height: '100%',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  listCourseImage: {
    width: 120,
    height: 120,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  progressContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2EA8FF',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    padding: 12,
  },
  listContentContainer: {
    flex: 1,
    padding: 12,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  notStartedBadge: {
    backgroundColor: 'rgba(46, 168, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(46, 168, 255, 0.3)',
  },
  inProgressBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  instructorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  instructorName: {
    fontSize: 11,
    color: '#B0B0B0',
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listFooter: {
    justifyContent: 'flex-end',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 6,
    borderRadius: 20,
    position: 'relative',
  },
  animatedBackground: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 36,
    height: 32,
    backgroundColor: '#2EA8FF',
    borderRadius: 16,
    zIndex: 1,
  },
  toggleButton: {
    width: 36,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  startButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#2EA8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default FavoriteCoursesGrid;
