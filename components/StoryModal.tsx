import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per slide

interface StorySlide {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
}

interface StoryModalProps {
  visible: boolean;
  onClose: () => void;
  slides: StorySlide[];
}

export default function StoryModal({ visible, onClose, slides }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startProgress = () => {
    progressAnim.setValue(0);
    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished) {
        goToNext();
      }
    });
  };

  const stopProgress = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      startProgress();
    } else {
      stopProgress();
      progressAnim.setValue(0);
    }
    return () => stopProgress();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      startProgress();
    }
  }, [currentIndex]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      stopProgress();
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, moveX } = gestureState;

      // Swipe detection
      if (Math.abs(dx) > 50) {
        if (dx > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      } else {
        // Tap detection - left half goes back, right half goes forward
        if (moveX < SCREEN_WIDTH / 2) {
          goToPrevious();
        } else {
          goToNext();
        }
      }
    },
  });

  const currentSlide = slides[currentIndex];

  if (!currentSlide) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[styles.container, { backgroundColor: currentSlide.backgroundColor }]} {...panResponder.panHandlers}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Progress bars */}
          <View style={styles.progressContainer}>
            {slides.map((_, index) => (
              <View key={index} style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width:
                        index < currentIndex
                          ? '100%'
                          : index === currentIndex
                            ? progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                              })
                            : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={currentSlide.icon} size={80} color="#FFF" />
          </View>
          <Text style={styles.slideNumber}>
            {currentIndex + 1}/{slides.length}
          </Text>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        {/* Navigation hint */}
        <View style={styles.navigationHint}>
          <Text style={styles.hintText}>Toque para navegar</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 50,
    padding: 8,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  slideNumber: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ManropeBold',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  navigationHint: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
});
