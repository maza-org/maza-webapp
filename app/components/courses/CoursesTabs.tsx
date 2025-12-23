import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import RadioButton from './RadioButton';

export type CourseTabType = 'inProgress' | 'favorites' | 'completed';

interface CoursesTabsProps {
  selectedFilter: CourseTabType;
  onFilterChange: (filter: CourseTabType) => void;
}

export default function CoursesTabs({ selectedFilter, onFilterChange }: CoursesTabsProps) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const buttonWidth = 100;

  const getAnimatedPosition = () => {
    switch (selectedFilter) {
      case 'inProgress':
        return 0;
      case 'favorites':
        return buttonWidth + 30;
      case 'completed':
        return buttonWidth * 2.6;
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

  const animatedText = (buttonIndex: number) => {
    return animationValue.interpolate({
      inputRange: [buttonWidth * (buttonIndex - 0.5), buttonWidth * buttonIndex, buttonWidth * (buttonIndex + 0.5)],
      outputRange: ['#666', '#fff', '#666'],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={styles.radioGroup}>
      <Animated.View
        style={[
          styles.animatedSelection,
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

const styles = StyleSheet.create({
  radioGroup: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#202024',
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
    backgroundColor: '#29292E',
    borderRadius: 999,
    zIndex: 0,
  },
});
