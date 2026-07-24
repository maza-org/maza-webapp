import React, { useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pause, Play, WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useOfflineDownloads } from '../hooks/useOfflineDownloads';
import { pauseCourseDownload, resumeCourseDownload } from '../services/offlineCourses';

export default function OfflineDownloadBanner() {
  const records = useOfflineDownloads();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const activeDownload = useMemo(() => (
    Object.values(records)
      .filter((record) => ['preparing', 'queued', 'downloading', 'paused', 'waiting'].includes(record.status))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  ), [records]);

  const download = activeDownload;

  if (Platform.OS === 'web' || !download) return null;

  const percent = Math.round(download.progress * 100);
  const paused = download.status === 'paused';
  const waiting = download.status === 'waiting';
  const contentProgress = download.totalFiles > 0
    ? `${download.completedFiles} de ${download.totalFiles} conteúdos`
    : '';
  const label = waiting
    ? 'A aguardar internet'
    : paused
      ? 'Download em pausa'
      : download.status === 'preparing'
        ? 'A preparar para uso offline'
        : `A guardar · ${percent}%${contentProgress ? ` · ${contentProgress}` : ''}`;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[styles.banner, { bottom: Math.max(insets.bottom, 12) + 70, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: waiting ? '#FFF7E6' : colors.primary + '12' }]}>
          {waiting
            ? <WifiOff size={17} color="#D97706" />
            : <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>{download.title}</Text>
          <Text style={[styles.status, { color: colors.textMuted }]}>{label}</Text>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { width: `${Math.max(percent, 3)}%`, backgroundColor: waiting ? '#F59E0B' : colors.primary }]} />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused || waiting ? 'Retomar download' : 'Pausar download'}
          style={[styles.action, { borderColor: colors.border }]}
          onPress={() => void (paused || waiting ? resumeCourseDownload(download.courseId) : pauseCourseDownload(download.courseId))}
        >
          {paused || waiting ? <Play size={17} color={colors.primary} /> : <Pause size={17} color={colors.text} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  banner: {
    position: 'absolute',
    left: 14,
    right: 14,
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16)',
  },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 12.5, fontWeight: '700' },
  status: { fontSize: 11, marginTop: 1 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 2 },
  action: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
