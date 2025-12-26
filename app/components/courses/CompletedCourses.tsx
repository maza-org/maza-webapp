
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Platform, Dimensions, Animated } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompletedCourses } from '@/app/hooks/useCoursesQueries';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface Course {
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  picture: {
    formats: {
      thumbnail: { url: string };
    };
  };
}

interface CompletedCourseData {
  id: number;
  updatedAt: string;
  course: Course;
}

interface CompletedCoursesProps {
  onRetry?: () => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const { width: screenWidth } = Dimensions.get('window');
const gap = 12;
const padding = 16;
const cardWidth = (screenWidth - (padding * 2) - gap) / 2;

export default function CompletedCourses({ onRetry }: CompletedCoursesProps) {
  const { data: courses = [], isLoading, error, refetch } = useCompletedCourses();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: viewMode === 'grid' ? 0 : 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [viewMode, animatedValue]);

  const handleRetry = () => {
    onRetry?.();
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#FF4B4B" />
        <Text style={styles.errorText}>Erro ao obter cursos terminados</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="award" size={48} color="#8F8F8F" />
        <Text style={styles.emptyText}>Nenhum curso concluído</Text>
        <Text style={styles.emptySubtext}>Seus certificados aparecerão aqui</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
        {courses.map((item) => {
          const courseData = item as unknown as CompletedCourseData;
          const { course } = courseData;
          const imageUrl = course?.picture?.formats?.thumbnail?.url;
          const completionDate = courseData.updatedAt ? formatDate(courseData.updatedAt) : 'Recentemente';
          const isGrid = viewMode === 'grid';

          return (
            <TouchableOpacity
              key={courseData.id}
              activeOpacity={0.9}
              onPress={() => {
                router.push({ pathname: '/room/lessons', params: { documentId: course.documentId } });
              }}
              style={[styles.card, isGrid ? styles.cardGrid : styles.cardList]}
            >
              <View style={[styles.cardMain, isGrid ? styles.cardMainGrid : styles.cardMainList]}>
                <View style={[styles.imageWrapper, isGrid ? styles.imageWrapperGrid : styles.imageWrapperList]}>
                  <Image source={{ uri: imageUrl }} style={styles.courseImage} />
                  <View style={styles.checkBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#2EA8FF" />
                  </View>
                </View>

                <View style={[styles.contentContainer, isGrid ? null : styles.contentContainerList]}>
                  <View>
                    <Text style={styles.authorText} numberOfLines={1}>{course.author}</Text>
                    <Text style={[styles.titleText, isGrid ? styles.titleGrid : styles.titleList]} numberOfLines={2}>
                      {course.title}
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="star" size={12} color="#FBA94C" />
                      <Text style={[styles.statText, { color: '#FBA94C' }]}>
                        {course.rating_avg?.toFixed(1) || '5.0'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                {isGrid ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Text style={styles.certificateText}>Certificado</Text>
                    <MaterialCommunityIcons name="certificate-outline" size={14} color="#0B1727" />
                  </View>
                ) : (
                  <>
                    <View style={styles.dateContainer}>
                      <Text style={styles.completedLabel}>Concluído em</Text>
                      <Text style={styles.dateText}>{completionDate}</Text>
                    </View>

                    <View style={styles.certificateBtn}>
                      <Text style={styles.certificateText}>Ver Certificado</Text>
                      <MaterialCommunityIcons name="certificate-outline" size={16} color="#0B1727" />
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
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

  // Card Main Content
  cardMain: {
    padding: 10,
    gap: 10,
  },
  cardMainGrid: {
    flexDirection: 'column',
  },
  cardMainList: {
    flexDirection: 'row',
    gap: 14,
  },

  // Image
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
    width: 72,
    height: 72,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 2,
  },

  // Content
  contentContainer: {
    justifyContent: 'space-between',
    gap: 4,
    flex: 1,
  },
  contentContainerList: {
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
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#8F8F8F',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#323238',
    marginHorizontal: 8,
  },

  // Footer
  cardFooter: {
    backgroundColor: '#1c1c1f',
    borderTopWidth: 1,
    borderTopColor: '#29292E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    gap: 2,
  },
  completedLabel: {
    color: '#8F8F8F',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dateText: {
    color: '#E1E1E6',
    fontSize: 12,
    fontWeight: '600',
  },
  certificateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2EA8FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  certificateText: {
    color: '#0B1727',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Error/Empty
  errorText: {
    color: '#E1E1E6',
    fontSize: 16,
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#29292E',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#E1E1E6',
  },
  emptyText: {
    color: '#E1E1E6',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#8F8F8F',
    marginTop: 8,
  },
});
