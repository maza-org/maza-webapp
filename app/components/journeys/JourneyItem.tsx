import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { Journey } from '@/app/types/journeys';
import { useGetJourneyCourses } from '@/app/hooks/useJourneyQueries';

interface JourneyItemProps {
  journey: Journey;
  onPress: (journey: Journey) => void;
}

export default function JourneyItem({ journey, onPress }: JourneyItemProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  // Fetch courses count
  const { data: courses } = useGetJourneyCourses(journey.documentId);
  const coursesCount = courses?.length || 0;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        categoryItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          marginBottom: 12,
        },
        iconContainer: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.buttonBackground,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        categoryInfo: {
          flex: 1,
        },
        categoryName: {
          fontSize: 16,
          fontWeight: '500',
          color: colors.text,
          fontFamily: 'ManropeMedium',
        },
        coursesCount: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 4,
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity style={themedStyles.categoryItem} onPress={() => onPress(journey)}>
      <View style={themedStyles.iconContainer}>
        <Ionicons name="map-outline" size={24} color={colors.primary} />
      </View>
      <View style={themedStyles.categoryInfo}>
        <Text style={themedStyles.categoryName}>{journey.name}</Text>
        <Text style={themedStyles.coursesCount}>{coursesCount > 1 ? `${coursesCount} Cursos` : `${coursesCount} Curso`}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.iconColor} />
    </TouchableOpacity>
  );
}
