import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

  const course = userCourse.course;
  if (!course) return null;

  const Header = () => (
    <View style={styles.courseHeader}>
      {course?.picture ? (
        <Image
          source={{ uri: getMediaUrl(course.picture?.formats?.thumbnail?.url || course.picture?.url) }}
          style={styles.profileImage}
        />
      ) : (
        <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colors.buttonBackground }]}>
          <Feather name="user" size={20} color={colors.iconColor} />
        </View>
      )}
      <View style={styles.courseHeaderInfo}>
        <Text style={[styles.instructorName, { color: colors.textSecondary }]}>{course.author}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={[styles.ratingText, { color: colors.text }]}>{course.rating_avg}</Text>
        </View>
      </View>
    </View>
  );

  const CoverImage = () => (
    <Image
      source={{ uri: getMediaUrl(course.cover?.formats?.thumbnail?.url || course.cover?.url) }}
      style={Platform.OS === 'web' ? styles.coverImageWeb : styles.coverImage}
      resizeMode="cover"
    />
  );

  const InfoAndProgress = () => (
    <>
      <Text style={[styles.courseTitle, { color: colors.text }]}>{course.title}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.text }]}>Progresso</Text>
          <Text style={[styles.progressText, { color: colors.text }]}>{userCourse.progress}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <View style={[styles.progressFill, { width: `${userCourse.progress}%` }]} />
        </View>
      </View>
    </>
  );

  return (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => onPress(course)}
    >
      {Platform.OS === 'web' ? (
        <>
          <CoverImage />
          <View style={styles.webContentContainer}>
            <Header />
            <InfoAndProgress />
          </View>
        </>
      ) : (
        <>
          <Header />
          <CoverImage />
          <InfoAndProgress />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 0 : 16,
    marginTop: 20,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    overflow: 'hidden',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(0,0,0,0.1)',
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
  coverImageWeb: {
    width: 250,
    height: '100%',
    minHeight: 180,
  },
  webContentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
