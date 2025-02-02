import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
}

interface UserCourse {
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
}

const CourseItem: React.FC<CourseItemProps> = ({
  title,
  instructor,
  progress,
  rating,
  duration,
  lessons,
  imageUrl,
  courseData,
}) => {
  return (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => {
        router.push({ pathname: '/room/lessons', params: { documentId: courseData.course.documentId } });
      }}
    >
      <Image source={{ uri: imageUrl }} style={styles.courseImage} />
      <View style={styles.courseInfo}>
        <Text style={styles.courseCategory}>{instructor}</Text>
        <Text style={styles.courseItemTitle}>{title.length > 20 ? `${title.substring(0, 20)}...` : title}</Text>
        <Text style={styles.moduleCount}>{`${lessons} Módulos • ${duration} • ${rating.toFixed(1)}★`}</Text>
      </View>
      <Text style={styles.percentageText}>{`${Math.round(progress)}%`}</Text>
    </TouchableOpacity>
  );
};

const CoursesInProgress = () => {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/user-courses?status=InProgress`, {
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
        <ActivityIndicator size="large" color="#8257E5" />
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum curso em andamento</Text>
      </View>
    );
  }

  console.log(JSON.stringify(courses[0], null, 2));

  return (
    <ScrollView style={styles.courseList}>
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
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  courseList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#121214',
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
    paddingHorizontal: 16,
    marginTop: 16,
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
