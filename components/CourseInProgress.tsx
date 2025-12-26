import React, { useState, useEffect, useRef } from 'react';
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="school-outline" size={64} color="#8F8F8F" />
        <Text style={styles.emptyTitle}>Nenhum curso em progresso</Text>
        <Text style={styles.emptySubtitle}>Comece um novo curso para acompanhar seu progresso aqui</Text>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/categories')}>
          <Text style={styles.exploreButtonText}>Explorar Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* View Toggle Toolbar */}
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
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode('grid')}
            accessibilityLabel="Grid View"
          >
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#0B1727' : '#B0B0B0'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode('list')}
            accessibilityLabel="List View"
          >
            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#0B1727' : '#B0B0B0'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid/List Content */}
      <View style={[styles.contentWrapper, viewMode === 'grid' ? styles.gridWrapper : styles.listWrapper]}>
        {courses.map((courseData) => {
          const course = courseData.course;
          const imageUrl = course?.picture?.formats?.thumbnail?.url;
          const isGrid = viewMode === 'grid';

          return (
            <TouchableOpacity
              key={courseData.id}
              style={[styles.card, isGrid ? styles.cardGrid : styles.cardList]}
              onPress={() => handleCoursePress(course.documentId)}
              activeOpacity={0.9}
            >
              <View style={[styles.cardMain, isGrid ? styles.cardMainGrid : styles.cardMainList]}>
                {/* Image & Progress */}
                <View style={[styles.imageWrapper, isGrid ? styles.imageWrapperGrid : styles.imageWrapperList]}>
                  <Image source={{ uri: imageUrl }} style={styles.image} />
                  <View style={styles.progressOverlay}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${courseData.progress}%` }]} />
                    </View>
                  </View>
                </View>

                {/* Info */}
                <View style={[styles.infoContainer, isGrid ? null : styles.infoContainerList]}>
                  <View>
                    <Text style={styles.authorText} numberOfLines={1}>{course.author}</Text>
                    <Text style={[styles.titleText, isGrid ? styles.titleGrid : styles.titleList]} numberOfLines={2}>
                      {course.title}
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <Ionicons name="pie-chart-outline" size={12} color="#8F8F8F" />
                    <Text style={styles.statsText}>{Math.round(courseData.progress)}% Concluído</Text>
                  </View>
                </View>
              </View>

              {/* Footer Action */}
              <View style={styles.cardFooter}>
                <View style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Continuar</Text>
                  <Feather name="play-circle" size={14} color="#2EA8FF" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    paddingHorizontal: 32,
    minHeight: 300,
    backgroundColor: '#121214',
  },

  // Layout Wrappers
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

  // Main Body
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

  // Image Section
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
    gap: 6,
  },
  statsText: {
    color: '#8F8F8F',
    fontSize: 11,
    fontWeight: '500',
  },

  // Footer
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

  // Empty State
  emptyTitle: {
    color: '#E1E1E6',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#8F8F8F',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 15,
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

export default CoursesInProgress;
