import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserCourse } from '@/types/home';
import { Course } from '@/types/course';
import { getMediaUrl } from '@/util/util';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ContinueCourseCardProps {
  userCourse: UserCourse;
  onPress: (course: Course) => void;
}

export default function ContinueCourseCard({ userCourse, onPress }: ContinueCourseCardProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => onPress(userCourse.course)}
    >
      <View style={styles.courseHeader}>
        {userCourse.course.picture ? (
          <Image
            source={{ uri: getMediaUrl(userCourse.course.picture.formats?.thumbnail?.url || userCourse.course.picture.url) }}
            style={styles.profileImage}
          />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colors.buttonBackground }]}>
            <Feather name="user" size={20} color={colors.iconColor} />
          </View>
        )}
        <View style={styles.courseHeaderInfo}>
          <Text style={[styles.instructorName, { color: colors.textSecondary }]}>{userCourse.course.author}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={[styles.ratingText, { color: colors.text }]}>{userCourse.course.rating_avg}</Text>
          </View>
        </View>
      </View>

      <Image
        source={{ uri: getMediaUrl(userCourse.course.cover?.formats?.thumbnail?.url || userCourse.course.cover?.url) }}
        style={styles.coverImage}
      />

      <Text style={[styles.courseTitle, { color: colors.text }]}>{userCourse.course.title}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.text }]}>Progresso</Text>
          <Text style={[styles.progressText, { color: colors.text }]}>{userCourse.progress}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <View style={[styles.progressFill, { width: `${userCourse.progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  courseCard: {
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
    fontSize: 14,
    fontFamily: 'ManropeRegular',
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
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  coverImage: {
    width: '100%',
    height: 160,
    borderRadius: 5,
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    fontFamily: 'ManropeMedium',
  },
  progressContainer: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'ManropeRegular',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 4,
  },
});
