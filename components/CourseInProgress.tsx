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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { baseUrl } from '@/services/api'; // Make sure you have expo/vector-icons installed

interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  picture: {
    formats: {
      thumbnail: {
        url: string;
      };
      small?: {
        url: string;
      };
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

interface CourseItemProps {
  title: string;
  instructor: string;
  progress: number;
  rating: number;
  duration: string;
  lessons: number;
  imageUrl: string;
  courseData: UserCourse;
  viewMode: 'grid' | 'list';
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 16px padding on each side + 16px gap

const CourseItem: React.FC<CourseItemProps> = ({
  title,
  instructor,
  progress,
  rating,
  duration,
  lessons,
  imageUrl,
  courseData,
  viewMode,
}) => {
  if (viewMode === 'grid') {
    return (
      <View style={styles.courseCard}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => {
            router.push({ pathname: '/room/lessons', params: { documentId: courseData.course.documentId } });
          }}
          activeOpacity={0.8}
        >
          {/* Course Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.courseImageGrid} />
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          </View>

          {/* Course Content */}
          <View style={styles.contentContainerGrid}>
            <Text style={styles.courseItemTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.courseCategory}>{instructor}</Text>
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              router.push({ pathname: '/room/lessons', params: { documentId: courseData.course.documentId } });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // List view (original layout)
  return (
    <View style={styles.courseItem}>
      <TouchableOpacity
        style={styles.listItemTouchable}
        onPress={() => {
          router.push({ pathname: '/room/lessons', params: { documentId: courseData.course.documentId } });
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.courseImage} />
        <View style={styles.courseInfo}>
          <Text style={styles.courseCategory}>{instructor}</Text>
          <Text style={styles.courseItemTitle}>{title.length > 20 ? `${title.substring(0, 20)}...` : title}</Text>
        </View>
        <Text style={styles.percentageText}>{`${Math.round(progress)}%`}</Text>
      </TouchableOpacity>

      {/* Continue Button for List View */}
      <TouchableOpacity
        style={styles.listContinueButton}
        onPress={() => {
          router.push({ pathname: '/room/lessons', params: { documentId: courseData.course.documentId } });
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.listContinueButtonText}>Continuar {Math.round(progress)}%</Text>
      </TouchableOpacity>
    </View>
  );
};

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
      setCourses(json.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Erro', 'Falha ao carregar cursos');
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="school-outline" size={80} color="#8F8F8F" />
        </View>
        <Text style={styles.emptyTitle}>Nenhum curso em progresso</Text>
        <Text style={styles.emptySubtitle}>Comece um novo curso para acompanhar seu progresso aqui</Text>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/categories')}>
          <Text style={styles.exploreButtonText}>Explorar Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.courseList}>
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
        {courses.map((courseData) => (
          <CourseItem
            key={courseData.id}
            title={courseData.course.title}
            instructor={courseData.course.author}
            progress={courseData.progress}
            rating={courseData.course.rating_avg}
            duration="--"
            lessons={0}
            imageUrl={courseData?.course?.picture?.formats?.thumbnail?.url}
            courseData={courseData}
            viewMode={viewMode}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  courseList: {
    flex: 1,
    backgroundColor: '#121214',
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  listContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginTop: 16,
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
  cardTouchable: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
  },
  continueButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#2EA8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listContinueButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    shadowColor: '#2EA8FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  listContinueButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  courseImageGrid: {
    width: '100%',
    height: '100%',
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
  contentContainerGrid: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
    paddingHorizontal: 32,
    marginTop: 16,
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
    borderRadius: 50,
  },
  emptyText: {
    color: '#8F8F8F',
    fontSize: 16,
  },
  coursesInProgress: {
    marginVertical: 24,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: '#29292E',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  courseImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
    gap: 2,
  },
  courseItemTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  courseCategory: {
    color: '#2EA8FF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  moduleCount: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 11,
  },
  percentageText: {
    color: '#2EA8FF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoursesInProgress;
