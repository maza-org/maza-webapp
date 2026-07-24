import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CheckCircle2,
  Download,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  WifiOff,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useOfflineDownload } from '../hooks/useOfflineDownloads';
import {
  OfflineCourseManifest,
  pauseCourseDownload,
  removeOfflineCourse,
  resumeCourseDownload,
  startCourseDownload,
} from '../services/offlineCourses';

type Props = {
  course: any;
  variant?: 'card' | 'action';
};

function formatBytes(bytes: number) {
  if (!bytes || bytes < 1024) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function formatContentSummary(download: OfflineCourseManifest | null) {
  if (!download) return '';
  const summary = download.contentSummary;
  const parts = [
    summary?.videos ? `${summary.videos} vídeo${summary.videos === 1 ? '' : 's'}` : '',
    summary?.audios ? `${summary.audios} áudio${summary.audios === 1 ? '' : 's'}` : '',
    summary?.pdfs ? `${summary.pdfs} PDF${summary.pdfs === 1 ? '' : 's'}` : '',
    summary?.activities ? `${summary.activities} atividade${summary.activities === 1 ? '' : 's'}` : '',
  ].filter(Boolean);
  return parts.join(' · ') || `${download.totalFiles} conteúdo${download.totalFiles === 1 ? '' : 's'}`;
}

export default function CourseOfflineDownloadCard({ course, variant = 'card' }: Props) {
  const { colors } = useTheme();
  const download = useOfflineDownload(course?.id);
  const status = download?.status;
  const percent = Math.round((download?.progress ?? 0) * 100);
  const active = ['preparing', 'queued', 'downloading'].includes(status ?? '');
  const resumable = ['paused', 'waiting', 'error'].includes(status ?? '');

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '14' }]}>
          <Download size={19} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Use sem ligação</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Disponível nas aplicações Android e iOS.</Text>
        </View>
      </View>
    );
  }

  const remove = () => {
    Alert.alert(
      status === 'completed' ? 'Remover download?' : 'Cancelar download?',
      status === 'completed'
        ? 'O curso continuará disponível quando tiver internet.'
        : 'O progresso guardado neste dispositivo será removido.',
      [
        { text: 'Manter', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => void removeOfflineCourse(course.id) },
      ]
    );
  };

  const start = () => void startCourseDownload(course);
  const resume = () => void (status === 'error' ? startCourseDownload(course) : resumeCourseDownload(course.id));

  const icon = status === 'completed'
    ? <CheckCircle2 size={19} color={colors.success} />
    : status === 'waiting'
      ? <WifiOff size={18} color="#F59E0B" />
      : active
        ? <ActivityIndicator size="small" color={colors.primary} />
        : <Download size={18} color={colors.primary} />;

  if (variant === 'action') {
    const action = status === 'completed'
      ? remove
      : active
        ? () => void pauseCourseDownload(course.id)
        : resumable
          ? resume
          : start;
    const accessibilityLabel = status === 'completed'
      ? 'Curso disponível offline. Toque para remover do dispositivo.'
      : active
        ? `Download do curso em ${percent}%. Toque para pausar.`
        : resumable
          ? `Retomar download do curso a partir de ${percent}%.`
          : 'Guardar curso para usar offline';
    const actionLabel = status === 'completed'
      ? 'Disponível offline'
      : active
        ? 'A guardar'
        : resumable
          ? 'Retomar download'
          : 'Guardar offline';

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: colors.card, borderColor: status === 'completed' ? colors.success : colors.border },
          pressed && styles.actionButtonPressed,
        ]}
        onPress={action}
      >
        {icon}
        <Text style={[styles.actionLabel, { color: colors.text }]} numberOfLines={1}>{actionLabel}</Text>
        {(active || resumable) && <Text style={[styles.actionPercent, { color: colors.text }]}>{percent}%</Text>}
      </Pressable>
    );
  }

  const title = status === 'completed'
    ? 'Disponível offline'
    : status === 'preparing'
      ? 'A preparar o curso'
      : status === 'queued'
        ? 'Download na fila'
        : status === 'downloading'
          ? `A transferir · ${percent}%`
          : status === 'paused'
            ? `Download em pausa · ${percent}%`
          : status === 'waiting'
              ? `A aguardar ligação · ${percent}%`
              : status === 'error'
                ? (download?.manifestVersion ?? 0) < 3
                  ? 'Actualização offline disponível'
                  : `Download interrompido · ${percent}%`
                : 'Guardar para usar offline';

  const transferred = download ? formatBytes(download.bytesWritten) : '';
  const total = download ? formatBytes(download.totalBytes) : '';
  const contentSummary = formatContentSummary(download);
  const detail = status === 'completed'
    ? `${contentSummary}${transferred ? ` · ${transferred}` : ''}`
    : status === 'preparing'
      ? download?.error || 'A reunir aulas e conteúdos…'
      : status === 'waiting'
        ? 'Retoma automaticamente quando a internet voltar.'
        : status === 'error'
          ? download?.error || 'Toque em tentar novamente.'
          : active || resumable
            ? `${download?.completedFiles ?? 0} de ${download?.totalFiles ?? 0} conteúdos${transferred ? ` · ${transferred}${total ? ` de ${total}` : ''}` : ''}`
    : 'Todo o curso, pronto para usar sem internet.';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: status === 'completed' ? colors.success + '14' : colors.primary + '14' }]}>
        {icon}
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>{detail}</Text>
        {(active || resumable) && (
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { width: `${Math.max(percent, status === 'preparing' ? 3 : 0)}%`, backgroundColor: status === 'waiting' ? '#F59E0B' : colors.primary }]} />
          </View>
        )}
      </View>

      {!status && (
        <Pressable accessibilityRole="button" accessibilityLabel="Guardar curso para usar offline" style={[styles.primaryAction, { backgroundColor: colors.primary }]} onPress={start}>
          <Download size={16} color="#fff" />
          <Text style={styles.primaryActionText}>Guardar</Text>
        </Pressable>
      )}

      {active && (
        <Pressable accessibilityRole="button" accessibilityLabel="Pausar download" style={[styles.iconAction, { borderColor: colors.border }]} onPress={() => void pauseCourseDownload(course.id)}>
          <Pause size={18} color={colors.text} />
        </Pressable>
      )}

      {resumable && (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Retomar download" style={[styles.iconAction, { borderColor: colors.border }]} onPress={resume}>
            {status === 'error' ? <RotateCcw size={18} color={colors.primary} /> : <Play size={18} color={colors.primary} />}
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar download" style={[styles.iconAction, { borderColor: colors.border }]} onPress={remove}>
            <Trash2 size={17} color="#EF4444" />
          </Pressable>
        </View>
      )}

      {status === 'completed' && (
        <Pressable accessibilityRole="button" accessibilityLabel="Remover curso do dispositivo" style={[styles.iconAction, { borderColor: colors.border }]} onPress={remove}>
          <Trash2 size={17} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  iconBox: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  body: { fontSize: 11.5, lineHeight: 16 },
  track: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 3 },
  actions: { flexDirection: 'row', gap: 6 },
  iconAction: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
  },
  actionButtonPressed: { opacity: 0.72 },
  actionLabel: { flexShrink: 1, fontSize: 12.5, fontWeight: '700' },
  actionPercent: { fontSize: 9, fontWeight: '700' },
});
