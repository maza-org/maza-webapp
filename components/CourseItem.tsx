import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { UserCourse } from '@/components/CourseInProgress';

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

const CourseItem = ({
  title,
  instructor,
  progress,
  rating,
  duration,
  lessons,
  imageUrl,
  courseData,
}: CourseItemProps) => {
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
        <Text style={styles.moduleCount}>
          {[lessons && `${lessons} Módulos`, duration, `${rating.toFixed(1)}★`].filter(Boolean).join(' • ')}
        </Text>
      </View>
      <Text style={styles.percentageText}>{`${Math.round(progress)}%`}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  coursesInProgress: {
    marginVertical: 24,
  },
  moduleCount: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 12,
    fontFamily: 'ManropeRegular',
  },
  percentageText: {
    color: '#2EA8FF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  coursesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coursesList: {
    gap: 12,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: '#29292E',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    margin: 10,
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  courseCategory: {
    color: '#2EA8FF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
});

export default CourseItem;
