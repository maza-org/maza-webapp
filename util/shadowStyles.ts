import { Platform } from 'react-native';

export const createShadow = (params: {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  radius?: number;
  elevation?: number;
}) => {
  const {
    color = '#000',
    offsetX = 0,
    offsetY = 2,
    opacity = 0.1,
    radius = 4,
    elevation = 3,
  } = params;

  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const createTextShadow = (params: {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  radius?: number;
}) => {
  const {
    color = '#000',
    offsetX = 0,
    offsetY = 1,
    radius = 2,
  } = params;

  if (Platform.OS === 'web') {
    return {
      textShadow: `${offsetX}px ${offsetY}px ${radius}px ${color}`,
    };
  }

  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: radius,
  };
};