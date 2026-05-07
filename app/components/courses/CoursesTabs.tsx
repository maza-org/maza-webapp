import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import RadioButton from './RadioButton';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export type CourseTabType = 'inProgress' | 'favorites' | 'certificates';

interface CoursesTabsProps {
  selectedFilter: CourseTabType;
  onFilterChange: (filter: CourseTabType) => void;
}

// Position values for each tab (3 tabs) - must match visual order: Favoritos, Em Curso, Certificados
const positions: Record<CourseTabType, number> = {
  favorites: 0,
  inProgress: 1,
  certificates: 2,
};

export default function CoursesTabs({ selectedFilter, onFilterChange }: CoursesTabsProps) {
  const animationValue = useRef(new Animated.Value(positions[selectedFilter])).current;
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        radioGroup: {
          flexDirection: 'row',
          marginHorizontal: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 999,
          padding: 4,
          position: 'relative',
          borderWidth: isDark ? 0 : 1,
          borderColor: colors.border,
        },
        animatedSelection: {
          position: 'absolute',
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          width: '33.33%',
          backgroundColor: isDark ? colors.inputBackground : colors.primary,
          borderRadius: 999,
          zIndex: 0,
        },
      }),
    [colors, isDark]
  );

  const getAnimatedPosition = () => positions[selectedFilter];

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: getAnimatedPosition(),
      useNativeDriver: false,
      friction: 20,
      tension: 150,
    }).start();
  }, [selectedFilter]);

  const selectedTextColor = isDark ? colors.text : '#FFFFFF';
  const unselectedTextColor = isDark ? colors.textMuted : colors.textSecondary;

  const animatedText = (buttonIndex: number) => {
    const positionValues = [0, 1, 2];
    const currentPos = positionValues[buttonIndex];
    const prevPos = buttonIndex > 0 ? positionValues[buttonIndex - 1] : -0.5;
    const nextPos = buttonIndex < 2 ? positionValues[buttonIndex + 1] : 2.5;

    const midBefore = (prevPos + currentPos) / 2;
    const midAfter = (currentPos + nextPos) / 2;

    return animationValue.interpolate({
      inputRange: [midBefore, currentPos, midAfter],
      outputRange: [unselectedTextColor, selectedTextColor, unselectedTextColor],
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
                translateX: animationValue.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: ['0%', '100%', '200%'],
                }),
              },
            ],
          },
        ]}
      />
      <RadioButton
        label="Favoritos"
        selected={selectedFilter === 'favorites'}
        onPress={() => onFilterChange('favorites')}
        animatedText={animatedText(0)}
      />
      <RadioButton
        label="Em Curso"
        selected={selectedFilter === 'inProgress'}
        onPress={() => onFilterChange('inProgress')}
        animatedText={animatedText(1)}
      />
      <RadioButton
        label="Certificados"
        selected={selectedFilter === 'certificates'}
        onPress={() => onFilterChange('certificates')}
        animatedText={animatedText(2)}
      />
    </View>
  );
}
