import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserCourse } from '@/types/home';
import { Course } from '@/types/course';

interface ContinueCourseCardProps {
  userCourse: UserCourse;
  onPress: (course: Course) => void;
}

export default function ContinueCourseCard({ userCourse, onPress }: ContinueCourseCardProps) {
  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => onPress(userCourse.course)}>
      <View style={styles.courseHeader}>
        {userCourse.course.picture ? (
          <Image source={{ uri: userCourse.course.picture.formats.thumbnail.url }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Feather name="user" size={20} color="#666" />
          </View>
        )}
        <View style={styles.courseHeaderInfo}>
          <Text style={styles.instructorName}>{userCourse.course.author}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{userCourse.course.rating_avg}</Text>
          </View>
        </View>
      </View>

      <Image source={{ uri: userCourse.course.cover?.formats?.thumbnail?.url }} style={styles.coverImage} />

      <Text style={styles.courseTitle}>{userCourse.course.title}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Progresso</Text>
          <Text style={styles.progressText}>{userCourse.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${userCourse.progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: '#29292E',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructorName: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#1fa2df',
    marginRight: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  coverImage: {
    width: '100%',
    height: 160,
    borderRadius: 5,
    marginBottom: 12,
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 4,
  },
});
