
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Platform, Dimensions, Animated } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompletedCourses } from '@/app/hooks/useCoursesQueries';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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

interface Certificate {
  id: number;
  documentId: string;
  createdAt: string;
}

interface CompletedCourseData {
  id: number;
  documentId: string;
  updatedAt: string;
  course: Course;
  certificate: Certificate;
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
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
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
      gap: 14,
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
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 2,
    },
    contentContainer: {
      justifyContent: 'space-between',
      gap: 4,
      flex: 1,
    },
    contentContainerList: {
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
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    divider: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.border,
      marginHorizontal: 8,
    },
    cardFooter: {
      backgroundColor: isDark ? '#1c1c1f' : colors.inputBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '500',
      textTransform: 'uppercase',
    },
    dateText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    certificateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      gap: 6,
    },
    certificateText: {
      color: isDark ? '#0B1727' : '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    errorText: {
      color: colors.text,
      fontSize: 16,
      marginTop: 16,
    },
    retryButton: {
      marginTop: 16,
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.text,
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 16,
    },
    emptySubtext: {
      color: colors.textMuted,
      marginTop: 8,
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

  const handleRetry = () => {
    onRetry?.();
    refetch();
  };

  if (isLoading) {
    return (
      <View style={themedStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={themedStyles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#FF4B4B" />
        <Text style={themedStyles.errorText}>Erro ao obter cursos terminados</Text>
        <TouchableOpacity style={themedStyles.retryButton} onPress={handleRetry}>
          <Text style={themedStyles.retryButtonText}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={themedStyles.centerContainer}>
        <Feather name="award" size={48} color={colors.textMuted} />
        <Text style={themedStyles.emptyText}>Nenhum curso concluído</Text>
        <Text style={themedStyles.emptySubtext}>Seus certificados aparecerão aqui</Text>
      </View>
    );
  }

  const toggleIconActiveColor = isDark ? '#0B1727' : '#FFFFFF';
  const toggleIconInactiveColor = colors.textMuted;

  return (
    <ScrollView
      style={themedStyles.container}
      showsVerticalScrollIndicator={false}
    >
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
              style={[themedStyles.card, isGrid ? themedStyles.cardGrid : themedStyles.cardList]}
            >
              <View style={[themedStyles.cardMain, isGrid ? themedStyles.cardMainGrid : themedStyles.cardMainList]}>
                <View style={[themedStyles.imageWrapper, isGrid ? themedStyles.imageWrapperGrid : themedStyles.imageWrapperList]}>
                  <Image source={{ uri: imageUrl }} style={themedStyles.courseImage} />
                  <View style={themedStyles.checkBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} />
                  </View>
                </View>

                <View style={[themedStyles.contentContainer, isGrid ? null : themedStyles.contentContainerList]}>
                  <View>
                    <Text style={themedStyles.authorText} numberOfLines={1}>{course.author}</Text>
                    <Text style={[themedStyles.titleText, isGrid ? themedStyles.titleGrid : themedStyles.titleList]} numberOfLines={2}>
                      {course.title}
                    </Text>
                  </View>

                  <View style={themedStyles.statsRow}>
                    <View style={themedStyles.statItem}>
                      <Ionicons name="star" size={12} color="#FBA94C" />
                      <Text style={[themedStyles.statText, { color: '#FBA94C' }]}>
                        {course.rating_avg?.toFixed(1) || '5.0'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={themedStyles.cardFooter}>
                {isGrid ? (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({ pathname: '/user/certificate', params: { certificateId: courseData.certificate.documentId } });
                    }}
                  >
                    <Text style={themedStyles.certificateText}>Certificado</Text>
                    <MaterialCommunityIcons name="certificate-outline" size={14} color={isDark ? '#0B1727' : '#FFFFFF'} />
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={themedStyles.dateContainer}>
                      <Text style={themedStyles.completedLabel}>Concluído em</Text>
                      <Text style={themedStyles.dateText}>{completionDate}</Text>
                    </View>

                    <TouchableOpacity
                      style={themedStyles.certificateBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push({ pathname: '/user/certificate', params: { certificateId: courseData.certificate.documentId } });
                      }}
                    >
                      <Text style={themedStyles.certificateText}>Ver Certificado</Text>
                      <MaterialCommunityIcons name="certificate-outline" size={16} color={isDark ? '#0B1727' : '#FFFFFF'} />
                    </TouchableOpacity>
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
