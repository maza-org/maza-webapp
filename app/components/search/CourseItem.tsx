import React from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { CourseItemProps } from '@/app/types/search';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function CourseItem({ item, onPress }: CourseItemProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    courseResult: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    courseImage: {
      width: 64,
      height: 64,
      borderRadius: 6,
      marginRight: 16,
      backgroundColor: colors.inputBackground,
    },
    courseInfo: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    courseCategory: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 4,
      fontFamily: 'ManropeMedium',
    },
    courseTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
      fontFamily: 'ManropeMedium',
    },
    courseDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: 'transparent',
    },
    ratingText: {
      color: '#FFD700',
      fontSize: 12,
      marginLeft: 4,
      fontFamily: 'ManropeRegular',
    },
    subscriberText: {
      color: colors.textMuted,
      fontSize: 11,
      fontFamily: 'ManropeRegular',
    },
  });

  return (
    <TouchableOpacity style={styles.courseResult} onPress={onPress}>
      <Image source={{ uri: item?.picture?.formats?.thumbnail?.url }} style={styles.courseImage} />
      <View style={styles.courseInfo}>
        <Text style={styles.courseCategory}>{item.subjects?.[0]?.name || item.author}</Text>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.courseDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating_avg ? item.rating_avg.toFixed(1) : 'N/A'}</Text>
          </View>
          <Text style={styles.subscriberText}>{item.subscribed} Inscritos</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
