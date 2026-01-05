import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import RadioButton from './RadioButton';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export type CourseTabType = 'inProgress' | 'favorites' | 'completed';

interface CoursesTabsProps {
  selectedFilter: CourseTabType;
  onFilterChange: (filter: CourseTabType) => void;
}

export default function CoursesTabs({ selectedFilter, onFilterChange }: CoursesTabsProps) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  // Position values for each tab
  const positions = {
    inProgress: 0,
    favorites: 130,
    completed: 260,
  };

  const themedStyles = useMemo(() => StyleSheet.create({
    radioGroup: {
      flexDirection: 'row',
      marginHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 999,
      padding: 4,
      position: 'relative',
    },
    animatedSelection: {
      position: 'absolute',
      top: 4,
      left: 4,
      right: 4,
      bottom: 4,
      width: '33%',
      backgroundColor: isDark ? colors.inputBackground : colors.primary,
      borderRadius: 999,
      zIndex: 0,
    },
  }), [colors, isDark]);

  const getAnimatedPosition = () => {
    switch (selectedFilter) {
      case 'inProgress':
        return positions.inProgress;
      case 'favorites':
        return positions.favorites;
      case 'completed':
        return positions.completed;
      default:
        return 0;
    }
  };

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: getAnimatedPosition(),
      useNativeDriver: false,
      friction: 20,
      tension: 150,
    }).start();
  }, [selectedFilter]);

  const selectedTextColor = isDark ? colors.text : '#FFFFFF';

  const animatedText = (buttonIndex: number) => {
    const positionValues = [positions.inProgress, positions.favorites, positions.completed];
    const currentPos = positionValues[buttonIndex];
    const prevPos = buttonIndex > 0 ? positionValues[buttonIndex - 1] : -65;
    const nextPos = buttonIndex < 2 ? positionValues[buttonIndex + 1] : 325;

    const midBefore = (prevPos + currentPos) / 2;
    const midAfter = (currentPos + nextPos) / 2;

    return animationValue.interpolate({
      inputRange: [midBefore, currentPos, midAfter],
      outputRange: [colors.textMuted, selectedTextColor, colors.textMuted],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={themedStyles.radioGroup}>
      <Animated.View
        style={[
          themedStyles.animatedSelection,
          {
            transform: [
              {
                translateX: animationValue,
              },
            ],
          },
        ]}
      />
      <RadioButton
        label="Em progresso"
        selected={selectedFilter === 'inProgress'}
        onPress={() => onFilterChange('inProgress')}
        animatedText={animatedText(0)}
      />
      <RadioButton
        label="Favoritos"
        selected={selectedFilter === 'favorites'}
        onPress={() => onFilterChange('favorites')}
        animatedText={animatedText(1)}
      />
      <RadioButton
        label="Terminados"
        selected={selectedFilter === 'completed'}
        onPress={() => onFilterChange('completed')}
        animatedText={animatedText(2)}
      />
    </View>
  );
}
