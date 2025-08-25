import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Course } from '@/types/course';
import CourseCard from './CourseCard';
import Shimmer from './Shimmer';

interface CourseSectionProps {
  title: string;
  courses: Course[];
  loading: boolean;
  onViewAll: () => void;
  onCoursePress: (course: Course) => void;
  badge?: {
    type: 'new' | 'recommended' | 'rating';
    text?: string;
    icon?: string;
  };
  showRating?: boolean;
}

export default function CourseSection({
  title,
  courses,
  loading,
  onViewAll,
  onCoursePress,
  badge,
  showRating = true,
}: CourseSectionProps) {
  const CourseCardShimmer = () => (
    <View style={styles.courseCardShimmer}>
      <Shimmer style={styles.courseImageShimmer}>
        <View style={{ width: '100%', height: 140, backgroundColor: '#29292E' }} />
      </Shimmer>

      <View style={styles.courseInfoShimmer}>
        <Shimmer style={{ width: 80, height: 20, marginBottom: 8 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <Shimmer style={{ height: 40, marginBottom: 12 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <View style={styles.instructorInfoShimmer}>
          <Shimmer style={{ width: 24, height: 24, borderRadius: 12 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E', borderRadius: 12 }} />
          </Shimmer>

          <Shimmer style={{ width: 80, height: 16 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
          </Shimmer>

          <Shimmer style={{ width: 60, height: 16 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.verTodos}>VER TODOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.coursesList}
        contentContainerStyle={styles.coursesListContent}
      >
        {loading
          ? [1, 2, 3].map((key) => <CourseCardShimmer key={key} />)
          : courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={onCoursePress}
                badge={badge}
                showRating={showRating}
              />
            ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  sectionHeader: {
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
    ...(Platform.OS === 'web' ? { marginHorizontal: 0 } : { marginHorizontal: -25, paddingHorizontal: 25 }),
  },
  coursesListContent: {
    paddingRight: Platform.OS === 'web' ? 0 : 25,
  },
  courseCardShimmer: {
    width: 280,
    backgroundColor: '#29292E',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  courseImageShimmer: {
    width: '100%',
    height: 140,
  },
  courseInfoShimmer: {
    padding: 16,
  },
  instructorInfoShimmer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
