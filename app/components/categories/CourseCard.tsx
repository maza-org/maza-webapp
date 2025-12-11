import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CourseCardProps } from '@/app/types/categories';
import { blurhash } from '@/util/util';

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const getImageSource = () => {
    const imageUrl = 
      course.picture?.formats?.thumbnail?.url || 
      course.picture?.formats?.small?.url || 
      course.picture?.url;
    
    return imageUrl ? { uri: imageUrl } : null;
  };

  const handlePress = () => {
    onPress(course);
  };

  return (
    <TouchableOpacity style={styles.courseCard} onPress={handlePress}>
      <View style={styles.thumbnailContainer}>
        <Image
          style={styles.thumbnail}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          source={getImageSource()}
        />
      </View>
      
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        
        <View style={styles.courseDetails}>
          {course.author && (
            <Text style={styles.author} numberOfLines={1}>
              {course.author}
            </Text>
          )}
          <Text style={styles.rating}>
            ★ {course.rating_avg.toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 100,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  courseInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  courseDetails: {
    gap: 4,
  },
  author: {
    color: '#666',
    fontSize: 14,
  },
  rating: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 6,
  },
});