import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCompletedCourses } from '@/app/hooks/useCoursesQueries';
import CourseItem from '@/components/CourseItem';

interface CompletedCoursesProps {
  onRetry?: () => void;
}

export default function CompletedCourses({ onRetry }: CompletedCoursesProps) {
  const { data: courses = [], isLoading, error, refetch } = useCompletedCourses();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
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
        <Feather name="alert-circle" size={48} color="#FF4444" />
        <Text style={styles.errorText}>Erro ao obter cursos terminados</Text>
        <Text style={styles.errorSubtext}>{error instanceof Error ? error.message : 'Erro desconhecido'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="book" size={48} color="#8F8F8F" />
        <Text style={styles.emptyText}>Ainda não há cursos concluídos</Text>
        <Text style={styles.emptySubtext}>Conclua seu primeiro curso para vê-lo aqui</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.courseList} showsVerticalScrollIndicator={false}>
      {courses.map((courseData) => (
        <CourseItem
          key={courseData?.id}
          title={courseData?.course.title}
          instructor={courseData?.course.author}
          progress={100}
          rating={courseData?.course.rating_avg}
          imageUrl={courseData?.course?.picture?.formats?.thumbnail?.url}
          courseData={courseData}
          duration={courseData?.course?.duration}
          lessons={[]} // Add lessons prop as required by CourseItem
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  courseList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#121214',
  },
  errorText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 24,
    maxWidth: 320,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8F8F8F',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8F8F8F',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#2EA8FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
