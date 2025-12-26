import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
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

const { width: screenWidth } = Dimensions.get('window');
const gap = 12;
const padding = 16;
const cardWidth = (screenWidth - (padding * 2) - gap) / 2;

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
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          removeFromFavorites.mutate(
            { courseId, token: user?.token || '' },
            {
              onSuccess: () => showSuccess('Curso removido dos favoritos!'),
              onError: () => showError('Falha ao remover dos favoritos'),
            }
          );
        },
      },
    ]);
  };

  const handleStartCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    startCourse.mutate(
      { courseId, token: user?.token || '' },
      {
        onSuccess: () => {
          setSelectedCourseId(null);
          router.push({ pathname: '/room/lessons', params: { documentId: courseId } });
        },
        onError: () => {
          setSelectedCourseId(null);
          showError('Falha ao iniciar o curso');
        },
      }
    );
  };

  const handleCoursePress = (courseId: string) => {
    router.push({ pathname: '/room/lessons', params: { documentId: courseId } });
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
        <Ionicons name="alert-circle-outline" size={64} color="#FF4B4B" />
        <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
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
        <Ionicons name="heart-outline" size={64} color="#8F8F8F" />
        <Text style={styles.emptyTitle}>Nenhum curso favorito</Text>
        <Text style={styles.emptySubtitle}>Seus cursos favoritos aparecerão aqui</Text>
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
                transform: [{
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 46],
                  }),
                }],
              },
            ]}
          />
          <TouchableOpacity style={styles.toggleButton} onPress={() => setViewMode('grid')}>
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#0B1727' : '#B0B0B0'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton} onPress={() => setViewMode('list')}>
            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#0B1727' : '#B0B0B0'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.contentWrapper, viewMode === 'grid' ? styles.gridWrapper : styles.listWrapper]}>
        {favorites.map((favorite: FavoriteCourse) => {
          const imageUrl = favorite.course.picture?.formats?.thumbnail?.url || favorite.course.picture?.url;
          const isGrid = viewMode === 'grid';

          return (
            <TouchableOpacity
              key={favorite.id}
              style={[styles.card, isGrid ? styles.cardGrid : styles.cardList]}
              onPress={() => handleCoursePress(favorite.course.documentId)}
              activeOpacity={0.9}
            >
              <View style={[styles.cardMain, isGrid ? styles.cardMainGrid : styles.cardMainList]}>
                {/* Image Section */}
                <View style={[styles.imageWrapper, isGrid ? styles.imageWrapperGrid : styles.imageWrapperList]}>
                  <Image source={{ uri: imageUrl }} style={styles.image} />

                  {/* Progress Overlay */}
                  <View style={styles.progressOverlay}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${favorite.progress}%` }]} />
                    </View>
                  </View>

                  {/* Top Right Heart Button */}
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFromFavorites(favorite.course.documentId, favorite.course.title);
                    }}
                  >
                    <Ionicons name="heart" size={14} color="#FF4B4B" />
                  </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={[styles.infoContainer, isGrid ? null : styles.infoContainerList]}>
                  <View>
                    <Text style={styles.authorText} numberOfLines={1}>{favorite.course.author}</Text>
                    <Text style={[styles.titleText, isGrid ? styles.titleGrid : styles.titleList]} numberOfLines={2}>
                      {favorite.course.title}
                    </Text>
                  </View>

                  {/* Rating/Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#FBA94C" />
                      <Text style={styles.ratingText}>{favorite.course.rating_avg?.toFixed(1) || '5.0'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.statusText}>
                      {favorite.progress > 0 ? `${Math.round(favorite.progress)}% Concluído` : 'Não iniciado'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer Section (Action) */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStartCourse(favorite.course.documentId);
                  }}
                  disabled={startCourse.isPending && selectedCourseId === favorite.course.documentId}
                >
                  {startCourse.isPending && selectedCourseId === favorite.course.documentId ? (
                    <ActivityIndicator size="small" color="#2EA8FF" />
                  ) : (
                    <>
                      <Text style={styles.actionButtonText}>
                        {favorite.progress > 0 ? 'Continuar' : 'Começar Agora'}
                      </Text>
                      <Feather name="arrow-right" size={14} color="#2EA8FF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  contentWrapper: {
    padding: padding,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gap,
  },
  listWrapper: {
    gap: 16,
  },

  // Card Styles
  card: {
    backgroundColor: '#202024',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#29292E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGrid: {
    width: cardWidth,
  },
  cardList: {
    width: '100%',
  },

  // Main Content Area
  cardMain: {
    padding: 10,
    gap: 10,
  },
  cardMainGrid: {
    flexDirection: 'column',
  },
  cardMainList: {
    flexDirection: 'row',
  },

  // Image & Overlays
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#29292E',
  },
  imageWrapperGrid: {
    width: '100%',
    aspectRatio: 1.1,
  },
  imageWrapperList: {
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(32, 32, 36, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2EA8FF',
  },

  // Text Info
  infoContainer: {
    justifyContent: 'space-between',
    gap: 4,
    flex: 1,
  },
  infoContainerList: {
    paddingVertical: 2,
  },
  authorText: {
    color: '#2EA8FF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  titleText: {
    color: '#E1E1E6',
    fontWeight: '700',
  },
  titleGrid: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  titleList: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251, 169, 76, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FBA94C',
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#323238',
  },
  statusText: {
    color: '#8F8F8F',
    fontSize: 11,
    fontWeight: '500',
  },

  // Footer Action
  cardFooter: {
    backgroundColor: '#1c1c1f',
    borderTopWidth: 1,
    borderTopColor: '#29292E',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: '#2EA8FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Errors & Empty States
  loadingText: {
    color: '#8F8F8F',
    marginTop: 16,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#29292E',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#E1E1E6' },
  emptyTitle: {
    color: '#E1E1E6',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#8F8F8F',
    marginTop: 8,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Toolbar
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
});

export default FavoriteCoursesGrid;
