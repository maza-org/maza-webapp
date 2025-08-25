import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading' | 'custom';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
  duration?: number;
  customIcon?: string;
  customColors?: {
    background: string;
    border: string;
    icon: string;
  };
  position?: 'top' | 'bottom';
  showIcon?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function Toast({
  visible,
  message,
  type,
  onHide,
  duration = 3000,
  customIcon,
  customColors,
  position = 'bottom',
  showIcon = true,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(position === 'bottom' ? 100 : -100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Don't auto-hide loading toasts
      if (type !== 'loading') {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, type, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'bottom' ? 100 : -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastConfig = () => {
    if (customColors && type === 'custom') {
      return {
        icon: customIcon || 'info',
        backgroundColor: customColors.background,
        borderColor: customColors.border,
        iconColor: customColors.icon,
      };
    }

    switch (type) {
      case 'info':
        return {
          icon: 'info',
          backgroundColor: '#3B82F6',
          borderColor: '#3B82F6',
          iconColor: '#FFF',
        };
      case 'success':
        return {
          icon: 'check-circle',
          backgroundColor: '#1fa2df',
          borderColor: '#1fa2df',
          iconColor: '#FFF',
        };
      case 'warning':
        return {
          icon: 'alert-triangle',
          backgroundColor: '#F59E0B',
          borderColor: '#F59E0B',
          iconColor: '#FFF',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
          iconColor: '#FFF',
        };
      case 'loading':
        return {
          icon: 'loader',
          backgroundColor: '#8B5CF6',
          borderColor: '#8B5CF6',
          iconColor: '#FFF',
        };
      default:
        return {
          icon: 'info',
          backgroundColor: '#3B82F6',
          borderColor: '#3B82F6',
          iconColor: '#FFF',
        };
    }
  };

  const config = getToastConfig();
  const isTop = position === 'top';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: '#202024',
          borderColor: config.borderColor,
          [isTop ? 'top' : 'bottom']: isTop ? 60 + insets.top : 120 + insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
            {type === 'loading' ? (
              <ActivityIndicator size="small" color={config.iconColor} />
            ) : (
              <Feather name={config.icon as any} size={18} color={config.iconColor} />
            )}
          </View>
        )}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    fontFamily: 'ManropeMedium',
  },
});
