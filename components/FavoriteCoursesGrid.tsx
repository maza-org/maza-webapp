import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      ...(isDark ? Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }) : {}),
    },
    cardGrid: {
      width: cardWidth,
    },
    cardList: {
      width: '100%',
    },
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
    imageWrapper: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
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
      backgroundColor: isDark ? 'rgba(32, 32, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
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
      backgroundColor: colors.primary,
    },
    infoContainer: {
      justifyContent: 'space-between',
      gap: 4,
      flex: 1,
    },
    infoContainerList: {
      paddingVertical: 2,
    },
    authorText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    titleText: {
      color: colors.text,
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
      backgroundColor: colors.border,
    },
    statusText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '500',
    },
    cardFooter: {
      backgroundColor: isDark ? '#1c1c1f' : colors.inputBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    loadingText: {
      color: colors.textMuted,
      marginTop: 16,
    },
    errorTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 16,
    },
    retryButton: {
      marginTop: 16,
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 8,
    },
    retryButtonText: { color: colors.text },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 16,
    },
    emptySubtitle: {
      color: colors.textMuted,
      marginTop: 8,
      marginBottom: 24,
    },
    exploreButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    exploreButtonText: {
      color: '#FFF',
      fontWeight: '700',
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
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
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
      backgroundColor: colors.primary,
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
  }), [colors, isDark]);

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
      <View style={themedStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={themedStyles.loadingText}>Carregando seus favoritos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={themedStyles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF4B4B" />
        <Text style={themedStyles.errorTitle}>Ops! Algo deu errado</Text>
        <TouchableOpacity style={themedStyles.retryButton} onPress={() => refetch()}>
          <Text style={themedStyles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const favorites = favoritesResponse?.data || [];

  if (favorites.length === 0) {
    return (
      <View style={themedStyles.centerContainer}>
        <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
        <Text style={themedStyles.emptyTitle}>Nenhum curso favorito</Text>
        <Text style={themedStyles.emptySubtitle}>Seus cursos favoritos aparecerão aqui</Text>
        <TouchableOpacity style={themedStyles.exploreButton} onPress={() => router.push('/categories')}>
          <Text style={themedStyles.exploreButtonText}>Explorar Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleIconActiveColor = isDark ? '#0B1727' : '#FFFFFF';
  const toggleIconInactiveColor = colors.textMuted;

  return (
    <ScrollView style={themedStyles.container} showsVerticalScrollIndicator={false}>
      <View style={themedStyles.toolbar}>
        <View style={themedStyles.viewToggle}>
          <Animated.View
            style={[
              themedStyles.animatedBackground,
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
          <TouchableOpacity style={themedStyles.toggleButton} onPress={() => setViewMode('grid')}>
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? toggleIconActiveColor : toggleIconInactiveColor} />
          </TouchableOpacity>
          <TouchableOpacity style={themedStyles.toggleButton} onPress={() => setViewMode('list')}>
            <Ionicons name="list" size={18} color={viewMode === 'list' ? toggleIconActiveColor : toggleIconInactiveColor} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[themedStyles.contentWrapper, viewMode === 'grid' ? themedStyles.gridWrapper : themedStyles.listWrapper]}>
        {favorites.map((favorite: FavoriteCourse) => {
          const imageUrl = favorite.course.picture?.formats?.thumbnail?.url || favorite.course.picture?.url;
          const isGrid = viewMode === 'grid';

          return (
            <TouchableOpacity
              key={favorite.id}
              style={[themedStyles.card, isGrid ? themedStyles.cardGrid : themedStyles.cardList]}
              onPress={() => handleCoursePress(favorite.course.documentId)}
              activeOpacity={0.9}
            >
              <View style={[themedStyles.cardMain, isGrid ? themedStyles.cardMainGrid : themedStyles.cardMainList]}>
                {/* Image Section */}
                <View style={[themedStyles.imageWrapper, isGrid ? themedStyles.imageWrapperGrid : themedStyles.imageWrapperList]}>
                  <Image source={{ uri: imageUrl }} style={themedStyles.image} />

                  {/* Progress Overlay */}
                  <View style={themedStyles.progressOverlay}>
                    <View style={themedStyles.progressBar}>
                      <View style={[themedStyles.progressFill, { width: `${favorite.progress}%` }]} />
                    </View>
                  </View>

                  {/* Top Right Heart Button */}
                  <TouchableOpacity
                    style={themedStyles.heartButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFromFavorites(favorite.course.documentId, favorite.course.title);
                    }}
                  >
                    <Ionicons name="heart" size={14} color="#FF4B4B" />
                  </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={[themedStyles.infoContainer, isGrid ? null : themedStyles.infoContainerList]}>
                  <View>
                    <Text style={themedStyles.authorText} numberOfLines={1}>{favorite.course.author}</Text>
                    <Text style={[themedStyles.titleText, isGrid ? themedStyles.titleGrid : themedStyles.titleList]} numberOfLines={2}>
                      {favorite.course.title}
                    </Text>
                  </View>

                  {/* Rating/Stats */}
                  <View style={themedStyles.statsRow}>
                    <View style={themedStyles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#FBA94C" />
                      <Text style={themedStyles.ratingText}>{favorite.course.rating_avg?.toFixed(1) || '5.0'}</Text>
                    </View>
                    <View style={themedStyles.divider} />
                    <Text style={themedStyles.statusText}>
                      {favorite.progress > 0 ? `${Math.round(favorite.progress)}% Concluído` : 'Não iniciado'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer Section (Action) */}
              <View style={themedStyles.cardFooter}>
                <TouchableOpacity
                  style={themedStyles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStartCourse(favorite.course.documentId);
                  }}
                  disabled={startCourse.isPending && selectedCourseId === favorite.course.documentId}
                >
                  {startCourse.isPending && selectedCourseId === favorite.course.documentId ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Text style={themedStyles.actionButtonText}>
                        {favorite.progress > 0 ? 'Continuar' : 'Começar Agora'}
                      </Text>
                      <Feather name="arrow-right" size={14} color={colors.primary} />
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

export default FavoriteCoursesGrid;
