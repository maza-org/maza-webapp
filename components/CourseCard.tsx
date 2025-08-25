import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  badge?: {
    type: 'new' | 'recommended' | 'rating';
    text?: string;
    icon?: string;
  };
  showRating?: boolean;
}

export default function CourseCard({ course, onPress, badge, showRating = true }: CourseCardProps) {
  const renderBadge = () => {
    if (!badge) return null;

    const badgeStyles = {
      new: { backgroundColor: 'rgba(31, 162, 223, 0.8)' },
      recommended: { backgroundColor: 'rgba(76, 175, 80, 0.8)' },
      rating: { backgroundColor: 'rgba(41, 41, 46, 0.9)' },
    };

    const badgeTexts = {
      new: 'NOVO',
      recommended: 'RECOMENDADO',
      rating: '',
    };

    return (
      <View style={[styles.courseBadge, badgeStyles[badge.type]]}>
        {badge.icon && <Feather name={badge.icon as any} size={12} color="#FFF" style={{ marginRight: 4 }} />}
        <Text style={styles.badgeText}>{badge.text || badgeTexts[badge.type]}</Text>
      </View>
    );
  };

  const formatSubscribers = (count: number) => {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  };

  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => onPress(course)}>
      {course.picture ? (
        <Image source={{ uri: course.picture.formats.small?.url }} style={styles.courseImage} />
      ) : (
        <View style={[styles.courseImage, styles.placeholderImage]}>
          <Feather name="image" size={24} color="#666" />
        </View>
      )}

      {renderBadge()}

      {showRating && (
        <View style={styles.courseRatingBadge}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.ratingText}>{course.rating_avg}</Text>
        </View>
      )}

      <View style={styles.courseInfo}>
        {course.subjects && course.subjects[0] && <Text style={styles.courseCategory}>{course.subjects[0].name}</Text>}

        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={styles.instructorInfo}>
          <Image source={{ uri: course.picture?.formats.thumbnail?.url }} style={styles.instructorAvatar} />
          <Text style={styles.instructorName}>{course.author ? course.author.slice(0, 5) + '...' : 'Instrutor'}</Text>
          <View style={styles.courseStats}>
            <Feather name="users" size={12} color="#FFF" />
            <Text style={styles.statsText}>{formatSubscribers(course.subscribed)} inscritos</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    width: 280,
    backgroundColor: '#29292E',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 140,
  },
  placeholderImage: {
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  courseRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(41, 41, 46, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  courseInfo: {
    padding: 16,
  },
  courseCategory: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  instructorName: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.7,
    marginRight: 8,
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
});
