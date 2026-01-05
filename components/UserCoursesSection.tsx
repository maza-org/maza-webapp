import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserCourse } from '@/types/home';
import { Course } from '@/types/course';
import Shimmer from './Shimmer';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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
  const { theme } = useTheme();
  const colors = Colors[theme];

  const CourseItemShimmer = () => (
    <View style={[styles.courseItem, { backgroundColor: colors.cardBackground }]}>
      <Shimmer style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: colors.buttonBackground, borderRadius: 8 }} />
      </Shimmer>

      <View style={styles.courseInfo}>
        <Shimmer style={{ width: 100, height: 16, marginBottom: 4 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: colors.buttonBackground }} />
        </Shimmer>

        <Shimmer style={{ width: '80%', height: 20, marginBottom: 4 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: colors.buttonBackground }} />
        </Shimmer>

        <Shimmer style={{ width: 60, height: 14 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: colors.buttonBackground }} />
        </Shimmer>
      </View>

      <Shimmer style={{ width: 40, height: 20 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: colors.buttonBackground }} />
      </Shimmer>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.coursesHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cursos em andamento</Text>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cursos em andamento</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.verTodos}>VER TODOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coursesList}>
        {userCourses.map((userCourse) => (
          <TouchableOpacity
            key={userCourse.id}
            style={[styles.courseItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => onCoursePress(userCourse.course)}
          >
            {userCourse.course.picture ? (
              <Image source={{ uri: userCourse.course.picture.formats.thumbnail.url }} style={styles.courseImage} />
            ) : (
              <View style={[styles.courseImage, styles.placeholderImage, { backgroundColor: colors.buttonBackground }]}>
                <Feather name="image" size={20} color={colors.iconColor} />
              </View>
            )}
            <View style={styles.courseInfo}>
              <Text style={[styles.courseCategory, { color: colors.textSecondary }]}>{userCourse.course.author}</Text>
              <Text style={[styles.courseItemTitle, { color: colors.text }]}>{userCourse.course.title}</Text>
              <Text style={[styles.moduleCount, { color: colors.textSecondary }]}>Progresso</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseCategory: {
    fontSize: 14,
  },
  courseItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  moduleCount: {
    fontSize: 12,
  },
  percentageText: {
    color: '#1fa2df',
    fontSize: 16,
    fontWeight: '600',
  },
});
