import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CourseCardProps } from '@/app/types/categories';
import { blurhash, getMediaUrl } from '@/util/util';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        courseCard: {
          flexDirection: 'row',
          padding: 16,
          backgroundColor: colors.cardBackground,
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
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8,
          lineHeight: 22,
          fontFamily: 'ManropeBold',
        },
        courseDetails: {
          gap: 4,
        },
        author: {
          color: colors.textSecondary,
          fontSize: 14,
          fontFamily: 'ManropeRegular',
        },
        rating: {
          color: '#FFD700',
          fontSize: 14,
          marginTop: 6,
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors]
  );

  const getImageSource = () => {
    const imageUrl =
      course.picture?.formats?.thumbnail?.url || course.picture?.formats?.small?.url || course.picture?.url;

    return imageUrl ? { uri: getMediaUrl(imageUrl) } : null;
  };

  const handlePress = () => {
    onPress(course);
  };

  return (
    <TouchableOpacity style={themedStyles.courseCard} onPress={handlePress}>
      <View style={themedStyles.thumbnailContainer}>
        <Image
          style={themedStyles.thumbnail}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          source={getImageSource()}
        />
      </View>

      <View style={themedStyles.courseInfo}>
        <Text style={themedStyles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={themedStyles.courseDetails}>
          {course.author && (
            <Text style={themedStyles.author} numberOfLines={1}>
              {course.author}
            </Text>
          )}
          <Text style={themedStyles.rating}>★ {(course.rating_avg ?? 0).toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
