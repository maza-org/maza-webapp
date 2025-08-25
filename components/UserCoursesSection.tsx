import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserCourse } from '@/types/home';
import { Course } from '@/types/course';
import Shimmer from './Shimmer';

interface UserCoursesSectionProps {
  userCourses: UserCourse[];
  loading: boolean;
  onCoursePress: (course: Course) => void;
  onViewAll: () => void;
}

export default function UserCoursesSection({
  userCourses,
  loading,
  onCoursePress,
  onViewAll,
}: UserCoursesSectionProps) {
  const CourseItemShimmer = () => (
    <View style={styles.courseItem}>
      <Shimmer style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E', borderRadius: 8 }} />
      </Shimmer>

      <View style={styles.courseInfo}>
        <Shimmer style={{ width: 100, height: 16, marginBottom: 4 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <Shimmer style={{ width: '80%', height: 20, marginBottom: 4 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <Shimmer style={{ width: 60, height: 14 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>
      </View>

      <Shimmer style={{ width: 40, height: 20 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
      </Shimmer>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.coursesHeader}>
          <Text style={styles.sectionTitle}>Cursos em andamento</Text>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.verTodos}>VER TODOS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coursesList}>
          {[1, 2, 3].map((key) => (
            <CourseItemShimmer key={key} />
          ))}
        </View>
      </View>
    );
  }

  if (userCourses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.coursesHeader}>
        <Text style={styles.sectionTitle}>Cursos em andamento</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.verTodos}>VER TODOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coursesList}>
        {userCourses.map((userCourse) => (
          <TouchableOpacity
            key={userCourse.id}
            style={styles.courseItem}
            onPress={() => onCoursePress(userCourse.course)}
          >
            {userCourse.course.picture ? (
              <Image source={{ uri: userCourse.course.picture.formats.thumbnail.url }} style={styles.courseImage} />
            ) : (
              <View style={[styles.courseImage, styles.placeholderImage]}>
                <Feather name="image" size={20} color="#666" />
              </View>
            )}
            <View style={styles.courseInfo}>
              <Text style={styles.courseCategory}>{userCourse.course.author}</Text>
              <Text style={styles.courseItemTitle}>{userCourse.course.title}</Text>
              <Text style={styles.moduleCount}>Progresso</Text>
            </View>
            <Text style={styles.percentageText}>{userCourse.progress}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  coursesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 0,
    fontFamily: 'ManropeBold',
  },
  verTodos: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  coursesList: {
    gap: 12,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: '#29292E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseCategory: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  courseItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleCount: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 12,
  },
  percentageText: {
    color: '#1fa2df',
    fontSize: 16,
    fontWeight: '600',
  },
});
