import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { baseUrl } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

// Interfaces
interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  picture: {
    formats: {
      thumbnail: { url: string };
      small?: { url: string };
    };
  };
}

export interface UserCourse {
  id: number;
  documentId: string;
  position: string;
  is_favorite: boolean;
  progress: number;
  course: Course;
  updatedAt: string;
  createdAt: string;
}

interface User {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yoma_id: string;
  token: string;
}

// Layout Constants
const { width: screenWidth } = Dimensions.get('window');
const gap = 12;
const padding = 16;
const cardWidth = (screenWidth - (padding * 2) - gap) / 2;

const CoursesInProgress = () => {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const animatedValue = useRef(new Animated.Value(0)).current;
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
      paddingHorizontal: 32,
      minHeight: 300,
      backgroundColor: colors.background,
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
    progressOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 6,
      backgroundColor: 'rgba(0,0,0,0.5)',
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
      gap: 6,
    },
    statsText: {
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
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtitle: {
      color: colors.textMuted,
      fontSize: 15,
      marginTop: 8,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    exploreButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    exploreButtonText: {
      color: '#FFF',
      fontSize: 15,
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

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do utilizador');
    }
  };

  const fetchCourses = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${baseUrl}/user-courses?status=InProgress`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();
      setCourses(json.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Alert.alert('Erro', 'Falha ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleCoursePress = (documentId: string) => {
    router.push({ pathname: '/room/lessons', params: { documentId } });
  };

  const toggleIconActiveColor = isDark ? '#0B1727' : '#FFFFFF';
  const toggleIconInactiveColor = colors.textMuted;

  if (loading) {
    return (
      <View style={themedStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={themedStyles.centerContainer}>
        <Ionicons name="school-outline" size={64} color={colors.textMuted} />
        <Text style={themedStyles.emptyTitle}>Nenhum curso em progresso</Text>
        <Text style={themedStyles.emptySubtitle}>Comece um novo curso para acompanhar seu progresso aqui</Text>
        <TouchableOpacity style={themedStyles.exploreButton} onPress={() => router.push('/journeys')}>
          <Text style={themedStyles.exploreButtonText}>Explorar Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={themedStyles.container} showsVerticalScrollIndicator={false}>
      {/* View Toggle Toolbar */}
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
          <TouchableOpacity
            style={themedStyles.toggleButton}
            onPress={() => setViewMode('grid')}
            accessibilityLabel="Grid View"
          >
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? toggleIconActiveColor : toggleIconInactiveColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={themedStyles.toggleButton}
            onPress={() => setViewMode('list')}
            accessibilityLabel="List View"
          >
            <Ionicons name="list" size={18} color={viewMode === 'list' ? toggleIconActiveColor : toggleIconInactiveColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid/List Content */}
      <View style={[themedStyles.contentWrapper, viewMode === 'grid' ? themedStyles.gridWrapper : themedStyles.listWrapper]}>
        {courses.map((courseData) => {
          const course = courseData.course;
          const imageUrl = course?.picture?.formats?.thumbnail?.url;
          const isGrid = viewMode === 'grid';

          return (
            <TouchableOpacity
              key={courseData.id}
              style={[themedStyles.card, isGrid ? themedStyles.cardGrid : themedStyles.cardList]}
              onPress={() => handleCoursePress(course.documentId)}
              activeOpacity={0.9}
            >
              <View style={[themedStyles.cardMain, isGrid ? themedStyles.cardMainGrid : themedStyles.cardMainList]}>
                {/* Image & Progress */}
                <View style={[themedStyles.imageWrapper, isGrid ? themedStyles.imageWrapperGrid : themedStyles.imageWrapperList]}>
                  <Image source={{ uri: imageUrl }} style={themedStyles.image} />
                  <View style={themedStyles.progressOverlay}>
                    <View style={themedStyles.progressBar}>
                      <View style={[themedStyles.progressFill, { width: `${courseData.progress}%` }]} />
                    </View>
                  </View>
                </View>

                {/* Info */}
                <View style={[themedStyles.infoContainer, isGrid ? null : themedStyles.infoContainerList]}>
                  <View>
                    <Text style={themedStyles.authorText} numberOfLines={1}>{course.author}</Text>
                    <Text style={[themedStyles.titleText, isGrid ? themedStyles.titleGrid : themedStyles.titleList]} numberOfLines={2}>
                      {course.title}
                    </Text>
                  </View>

                  <View style={themedStyles.statsRow}>
                    <Ionicons name="pie-chart-outline" size={12} color={colors.textMuted} />
                    <Text style={themedStyles.statsText}>{Math.round(courseData.progress)}% Concluído</Text>
                  </View>
                </View>
              </View>

              {/* Footer Action */}
              <View style={themedStyles.cardFooter}>
                <View style={themedStyles.actionButton}>
                  <Text style={themedStyles.actionButtonText}>Continuar</Text>
                  <Feather name="play-circle" size={14} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CoursesInProgress;
