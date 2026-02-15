import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import PulseAnimation from './PulseAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface AudioPlayerModalProps {
  audioUrl: string;
  title?: string;
  onClose: () => void;
  onAudioEnd?: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function AudioPlayerModal({ audioUrl, title, onClose, onAudioEnd }: AudioPlayerModalProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    player.play();
  }, [player]);

  useEffect(() => {
    if (status.currentTime >= status.duration && status.duration > 0 && !status.playing) {
      if (onAudioEnd) onAudioEnd();
    }
  }, [status.currentTime, status.duration, status.playing, onAudioEnd]);

  useEffect(() => {
    player.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed, player]);

  const togglePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seekForward = () => {
    player.seekTo(Math.min(status.duration, status.currentTime + 10));
  };

  const seekBackward = () => {
    player.seekTo(Math.max(0, status.currentTime - 10));
  };

  const toggleSpeed = () => {
    if (playbackSpeed === 1.0) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2.0);
    else setPlaybackSpeed(1.0);
  };

  // Simple progress bar tap handler (could be improved with PanResponder for dragging)
  const handleProgressPress = (e: any) => {
    const pressX = e.nativeEvent.locationX;
    const progressWidth = width - 48; // padding horizontal 24 * 2
    const percentage = pressX / progressWidth;
    const newTime = percentage * status.duration;
    player.seekTo(newTime);
  };

  const progress = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 16,
    },
    closeButton: {
      padding: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
    },
    visualizerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trackInfo: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      color: '#FFF',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'ManropeBold',
      marginBottom: 8,
    },
    subtitle: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 16,
      fontFamily: 'ManropeRegular',
    },
    controlsContainer: {
      paddingBottom: 40,
      width: '100%',
    },
    progressBarContainer: {
      height: 40, // Expanded touch area
      justifyContent: 'center',
    },
    progressBarBackground: {
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#FFF',
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -10, // Adjust to be closer to bar
    },
    timeText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 12,
      fontFamily: 'ManropeRegular',
    },
    mainControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
    },
    secondaryControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 32,
      paddingHorizontal: 20,
    },
    playButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    secondaryButton: {
      padding: 12,
    },
    speedButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <Modal animationType="slide" transparent={false} visible={true} onRequestClose={onClose}>
      <LinearGradient colors={isDark ? ['#1A1A1A', '#000000'] : [colors.primary, '#2A3047']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="chevron-down" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.visualizerContainer}>
          <PulseAnimation isPlaying={status.playing} size={200} color="rgba(255,255,255,0.15)" />
          <View style={{ position: 'absolute' }}>
            <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {title || 'Reproduzindo Áudio'}
            </Text>
          </View>

          <TouchableOpacity style={styles.progressBarContainer} onPress={handleProgressPress} activeOpacity={1}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </TouchableOpacity>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
          </View>

          <View style={styles.mainControls}>
            <TouchableOpacity onPress={toggleSpeed} style={styles.secondaryButton}>
              <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={seekBackward} style={styles.secondaryButton}>
              <MaterialIcons name="replay-10" size={32} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
              {status.isBuffering ? (
                <ActivityIndicator color={colors.primary} size="large" />
              ) : (
                <Ionicons
                  name={status.playing ? 'pause' : 'play'}
                  size={40}
                  color={isDark ? '#000' : colors.primary}
                  style={{ marginLeft: status.playing ? 0 : 4 }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={seekForward} style={styles.secondaryButton}>
              <MaterialIcons name="forward-10" size={32} color="#FFF" />
            </TouchableOpacity>

            <View style={{ width: 40 }} />
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
}
