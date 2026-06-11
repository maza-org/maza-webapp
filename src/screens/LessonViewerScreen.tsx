import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, Linking, Platform, LayoutChangeEvent
} from 'react-native';
import CrossPlatformWebView from '../components/CrossPlatformWebView';
import QuizRenderer from '../components/QuizRenderer';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode, Video } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import * as Sharing from 'expo-sharing';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, ArrowLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { API_BASE as _API_BASE, getPersistentCached } from '../services/api';
import { cacheMediaInBackground, getCachedMediaUri } from '../utils/mediaCache';
import NativePdf from '../components/NativePdf';

const API_BASE = _API_BASE.replace('/api', '');
const TRANSCRIPT_HIGHLIGHT_LEAD_SECONDS = 0.8;

const CONTENT_TYPE_LABELS: Record<string, string> = {
  VIDEO: 'Vídeo',
  AUDIO: 'Áudio',
  PDF: 'PDF',
  HTML: 'Atividade',
  TEXT: 'Texto',
  QUIZ: 'Quiz',
};

function resolveMediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function normalizeMediaSource(url: string | null | undefined) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return '';
  try {
    const parsed = new URL(resolved);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch {
    return resolved.split('#')[0].split('?')[0];
  }
}

function isSameMediaSource(a: string | null | undefined, b: string | null | undefined) {
  const left = normalizeMediaSource(a);
  const right = normalizeMediaSource(b);
  return !!left && !!right && left === right;
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function extractYouTubeId(url: string | null | undefined) {
  if (!url) return null;

  const trimmed = url.trim();
  const directMatch = trimmed.match(/^[\w-]{11}$/);
  if (directMatch) return directMatch[0];

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/
  );
  if (match?.[1]) return match[1];

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const id = parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop();
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
  } catch {}

  return null;
}

function getHtmlWebViewSource(htmlContent: string | null | undefined) {
  const content = htmlContent?.trim();
  if (!content) return null;
  const isInlineHtml = /^(<!doctype\s+html|<html|<body|<div|<section|<main|<script|<style)/i.test(content);
  if (isInlineHtml) return { html: content };
  const resolved = resolveMediaUrl(content);
  if (resolved && /\/uploads\/.+\.(html|htm)(?:[?#].*)?$/i.test(resolved)) {
    const uploadPath = resolved.replace(/^https?:\/\/[^/]+\/uploads\//i, '/uploads/');
    return { uri: `${API_BASE}/api/media/html/${uploadPath.replace(/^\//, '')}` };
  }
  return resolved?.startsWith('http') ? { uri: resolved } : resolved ? { html: resolved } : null;
}

function shouldUseCachedVideoUri(cachedUri: string | null, remoteUri: string | null) {
  if (!cachedUri) return false;
  if (Platform.OS !== 'ios') return true;
  if (!remoteUri) return true;

  // iOS AVFoundation is much more reliable with audio tracks when local files
  // keep a recognizable video extension. Remote URLs still provide Content-Type.
  return /\.(mp4|m4v|mov)(?:[?#].*)?$/i.test(cachedUri);
}

function configureMediaAudioMode() {
  return Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

type Question = {
  id: string;
  questionType: string;
  text: string;
  options: string; // JSON string
  explanation?: string | null;
  points: number;
};

type Lesson = {
  id: string;
  title: string;
  contentType: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  htmlContent?: string | null;
  textContent?: string | null;
  transcriptSourceUrl?: string | null;
  duration?: number | null;
  minDuration?: number | null;
  points?: number;
  quiz?: { id: string; questions: Question[] } | null;
};

type TranscriptSegment = {
  id: string;
  text: string;
  start: number;
  end: number;
};

function hasFullLessonPayload(lesson?: Lesson | null) {
  if (!lesson) return false;
  if (lesson.contentType === 'VIDEO') return lesson.videoUrl !== undefined;
  if (lesson.contentType === 'AUDIO') return lesson.audioUrl !== undefined;
  if (lesson.contentType === 'PDF') return lesson.pdfUrl !== undefined;
  if (lesson.contentType === 'HTML') return lesson.htmlContent !== undefined;
  if (lesson.contentType === 'TEXT') return lesson.textContent !== undefined;
  if (lesson.contentType === 'QUIZ') return lesson.quiz !== undefined;
  return true;
}

function getRequiredLessonSeconds(lesson: Lesson) {
  if (lesson.contentType !== 'VIDEO') return 0;
  if (lesson.minDuration && lesson.minDuration > 0) return lesson.minDuration;
  return 0;
}

function cleanTranscriptText(text: string | null | undefined) {
  if (!text) return '';

  const cleanedLines = text
    .split(/\r?\n/)
    .map((line) => line
      .replace(/legendas?\s+pela\s+comunidade\s+da\s+amara\.?\s*org\.?/gi, '')
      .replace(/legendas?\s+pela\s+comunidade\s+da\s+amara\.?/gi, '')
      .replace(/subtitles?\s+by\s+the\s+amara\.?\s*org\s+community\.?/gi, '')
      .replace(/\b(?:www\.)?amara\.?\s*org\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
    )
    .filter((line) => line && !/^org\.?$/i.test(line));

  const cleaned = cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!cleaned || /^org\.?$/i.test(cleaned)) return '';
  return cleaned;
}

function splitTranscriptIntoSegments(text: string, totalDuration: number): TranscriptSegment[] {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (!cleanText) return [];

  const rawParts = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleanText];
  const chunks: string[] = [];
  let current = '';

  rawParts.forEach((part) => {
    const next = current ? `${current} ${part.trim()}` : part.trim();
    if (next.length > 78 && current) {
      chunks.push(current);
      current = part.trim();
    } else {
      current = next;
    }
  });
  if (current) chunks.push(current);

  const safeDuration = Math.max(totalDuration || 0, chunks.length * 3, 20);
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.length, 0) || 1;
  let cursor = 0;

  return chunks.map((chunk, index) => {
    const segmentDuration = Math.max(1.5, (chunk.length / totalChars) * safeDuration);
    const start = cursor;
    const end = index === chunks.length - 1 ? safeDuration : cursor + segmentDuration;
    cursor = end;
    return { id: `${index}-${start.toFixed(2)}`, text: chunk, start, end };
  });
}

// ------------------------------------------------------------
// GameWebView - renders HTML game with a replay button
// ------------------------------------------------------------
function GameWebView({
  source,
  onInteraction,
  onReady,
}: {
  source: { uri: string } | { html: string };
  onInteraction?: () => void;
  onReady?: () => void;
}) {
  const { colors: themeColors } = useTheme();
  const webViewRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const sourceKey = 'uri' in source ? source.uri : source.html.slice(0, 160);

  useEffect(() => {
    setReady(false);
    const fallback = setTimeout(markReady, 1200);
    return () => clearTimeout(fallback);
  }, [sourceKey]);

  const markReady = () => {
    setReady(true);
    onReady?.();
  };

  const interactionScript = `
    (function () {
      if (window.__mazaLessonViewerBridgeInstalled) return true;
      window.__mazaLessonViewerBridgeInstalled = true;
      var sent = false;
      var css = 'html,body{touch-action:manipulation;-webkit-tap-highlight-color:transparent;}button,a,[role="button"],input,label,select,textarea{pointer-events:auto!important;touch-action:manipulation;}';
      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      (document.head || document.documentElement).appendChild(style);

      function notifyReady() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'html-ready' }));
        }
      }
      function notify() {
        if (sent) return;
        sent = true;
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'html-interaction' }));
        }
      }
      ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown', 'pointerup', 'mousedown'].forEach(function (eventName) {
        document.addEventListener(eventName, notify, { passive: true, capture: true });
        window.addEventListener(eventName, notify, { passive: true, capture: true });
      });
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(notifyReady, 80);
      } else {
        document.addEventListener('DOMContentLoaded', notifyReady, { once: true });
        window.addEventListener('load', notifyReady, { once: true });
      }
      setTimeout(notifyReady, 800);
      true;
    })();
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data ?? '{}');
      if (data.type === 'html-ready') {
        markReady();
      }
      if (data.type === 'html-interaction') {
        onInteraction?.();
      }
    } catch {}
  };

  return (
    <View style={{ flex: 1 }}>
      <CrossPlatformWebView
        webViewRef={webViewRef}
        source={source as any}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        injectedJavaScript={interactionScript}
        injectedJavaScriptBeforeContentLoaded={interactionScript}
        onMessage={handleMessage}
        onLoadEnd={markReady}
        style={{ flex: 1, opacity: ready ? 1 : 0 }}
      />
      {!ready && (
        <View style={[gameStyles.loadingOverlay, { backgroundColor: themeColors.background }]}>
          <View style={[gameStyles.loadingCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[gameStyles.loadingTitle, { color: themeColors.text }]}>A preparar aula...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function NativeVideoPlayer({
  uri,
  onPlaybackTime,
}: {
  uri: string;
  onPlaybackTime: (currentTime: number, duration: number) => void;
}) {
  const videoRef = useRef<Video | null>(null);
  const autoplayStartedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  const forceAudiblePlayback = async () => {
    await configureMediaAudioMode();
    const status = await videoRef.current?.getStatusAsync();
    if (!status?.isLoaded) return false;

    await videoRef.current?.setStatusAsync({
      shouldPlay: true,
      isMuted: false,
      volume: 1,
      progressUpdateIntervalMillis: 350,
    });
    if (!status.isPlaying) {
      await videoRef.current?.playAsync();
    }
    autoplayStartedRef.current = true;
    return true;
  };

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setInterval> | null = null;

    autoplayStartedRef.current = false;
    setIsReady(false);
    setHasPlaybackError(false);

    configureMediaAudioMode()
      .then(() => {
        if (!mounted) return;
        retryTimer = setInterval(() => {
          attempts += 1;
          forceAudiblePlayback()
            .then((started) => {
              if ((started || attempts >= 10) && retryTimer) {
                clearInterval(retryTimer);
                retryTimer = null;
              }
            })
            .catch(() => {});
        }, 500);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      if (retryTimer) clearInterval(retryTimer);
    };
  }, [uri]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={{ flex: 1, backgroundColor: '#000' }}
        useNativeControls
        shouldPlay
        isMuted={false}
        volume={1}
        resizeMode={ResizeMode.CONTAIN}
        progressUpdateIntervalMillis={350}
        onLoadStart={() => {
          setIsReady(false);
          setHasPlaybackError(false);
        }}
        onLoad={() => {
          setIsReady(true);
          forceAudiblePlayback().catch(() => {});
        }}
        onReadyForDisplay={() => {
          setIsReady(true);
          forceAudiblePlayback().catch(() => {});
        }}
        onError={() => {
          setHasPlaybackError(true);
          setIsReady(true);
        }}
        onPlaybackStatusUpdate={(status: any) => {
          if (!status?.isLoaded) return;
          if (!autoplayStartedRef.current && !status.isPlaying) {
            forceAudiblePlayback().catch(() => {});
          }
          onPlaybackTime((status.positionMillis ?? 0) / 1000, (status.durationMillis ?? 0) / 1000);
        }}
      />
      {!isReady && (
        <View style={styles.mediaLoadingOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.mediaLoadingText}>A carregar vídeo...</Text>
        </View>
      )}
      {hasPlaybackError && (
        <View style={styles.mediaLoadingOverlay}>
          <Ionicons name="alert-circle-outline" size={28} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.mediaLoadingText}>Não foi possível carregar o vídeo</Text>
        </View>
      )}
    </View>
  );
}

function YouTubeWebPlayer({
  videoId,
  duration,
  onPlaybackTime,
}: {
  videoId: string;
  duration: number;
  onPlaybackTime: (currentTime: number, duration: number) => void;
}) {
  const onPlaybackTimeRef = useRef(onPlaybackTime);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    onPlaybackTimeRef.current = onPlaybackTime;
  }, [onPlaybackTime]);

  useEffect(() => {
    if (!loaded) return;
    const safeDuration = Math.max(15, Math.floor(duration || 0) || 60);
    const start = Date.now();
    onPlaybackTimeRef.current(0, safeDuration);
    const timer = setInterval(() => {
      const elapsed = Math.min(safeDuration, (Date.now() - start) / 1000);
      onPlaybackTimeRef.current(elapsed, safeDuration);
      if (elapsed >= safeDuration) clearInterval(timer);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [loaded, duration]);

  if (Platform.OS !== 'web') return null;

  const origin = (globalThis as any).location?.origin ?? '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;

  return (
    <View style={styles.youtubeFrameWrap}>
      {React.createElement('iframe', {
        src: embedUrl,
        title: 'YouTube video lesson',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen',
        allowFullScreen: true,
        allowfullscreen: 'true',
        webkitallowfullscreen: 'true',
        mozallowfullscreen: 'true',
        onLoad: () => setLoaded(true),
        style: {
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#000',
          display: 'block',
        },
      })}
    </View>
  );
}

function NativeAudioPlayer({
  uri,
  title,
  color,
  mutedColor,
  onPlaybackTime,
}: {
  uri: string;
  title: string;
  color: string;
  mutedColor: string;
  onPlaybackTime: (currentTime: number, duration: number) => void;
}) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await configureMediaAudioMode();
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 350 },
        (status: any) => {
          if (!status?.isLoaded) return;
          const pos = (status.positionMillis ?? 0) / 1000;
          const dur = (status.durationMillis ?? 0) / 1000;
          if (mounted) {
            setPlaying(!!status.isPlaying);
            setPosition(pos);
            setDuration(dur);
            setLoading(false);
          }
          onPlaybackTime(pos, dur);
        }
      );
      soundRef.current = sound;
    })().catch(() => setLoading(false));

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [uri]);

  const toggle = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    if (playing) await sound.pauseAsync();
    else await sound.playAsync();
  };

  const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <View style={styles.nativeAudioBox}>
      <Ionicons name="headset-outline" size={58} color={color} style={{ marginBottom: 12 }} />
      <Text style={[styles.audioTitle, { color }]} numberOfLines={2}>{title}</Text>
      <View style={styles.nativeAudioControls}>
        <TouchableOpacity style={[styles.audioPlayBtn, { backgroundColor: color }]} onPress={toggle} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name={playing ? 'pause' : 'play'} size={22} color="#fff" />}
        </TouchableOpacity>
        <View style={styles.audioProgressWrap}>
          <View style={[styles.audioProgressTrack, { backgroundColor: mutedColor }]}>
            <View style={[styles.audioProgressFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
          <Text style={[styles.audioTime, { color: mutedColor }]}>
            {Math.floor(position)}s / {Math.floor(duration || 0)}s
          </Text>
        </View>
      </View>
    </View>
  );
}

function WebAudioPlayer({
  uri,
  title,
  color,
  mutedColor,
  onPlaybackTime,
}: {
  uri: string;
  title: string;
  color: string;
  mutedColor: string;
  onPlaybackTime: (currentTime: number, duration: number) => void;
}) {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const updateProgress = (audio: any) => {
    const pos = Number.isFinite(audio?.currentTime) ? audio.currentTime : 0;
    const dur = Number.isFinite(audio?.duration) ? audio.duration : 0;
    setPosition(pos);
    setDuration(dur);
    onPlaybackTime(pos, dur);
  };

  const formatTime = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.nativeAudioBox}>
      <Ionicons name="headset-outline" size={52} color={color} style={{ marginBottom: 10 }} />
      <Text style={[styles.audioTitle, { color }]} numberOfLines={2}>{title}</Text>
      <View style={styles.webAudioControlWrap}>
        {React.createElement('audio', {
          controls: true,
          autoPlay: true,
          preload: 'auto',
          src: uri,
          style: {
            width: '100%',
            height: 44,
            display: 'block',
            outline: 'none',
          },
          onLoadedMetadata: (event: any) => {
            updateProgress(event.currentTarget);
            event.currentTarget.play?.().catch?.(() => {});
          },
          onTimeUpdate: (event: any) => updateProgress(event.currentTarget),
          onEnded: (event: any) => updateProgress(event.currentTarget),
        })}
      </View>
      <Text style={[styles.audioTime, { color: mutedColor }]}>
        {formatTime(position)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

function PdfPanel({ uri, colors, onReachedEnd }: { uri: string; colors: any; onReachedEnd?: () => void }) {
  const [opening, setOpening] = useState(false);
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const alreadyCached = await getCachedMediaUri(uri);
      if (mounted && alreadyCached) {
        setCachedUri(alreadyCached);
        return;
      }
      const downloaded = await cacheMediaInBackground(uri);
      if (mounted && downloaded) setCachedUri(downloaded);
    })();
    return () => { mounted = false; };
  }, [uri]);

  const openPdf = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const localUri = cachedUri ?? await cacheMediaInBackground(uri);
      if (localUri && await Sharing.isAvailableAsync()) {
        setCachedUri(localUri);
        await Sharing.shareAsync(localUri, { mimeType: 'application/pdf', dialogTitle: 'Abrir PDF' });
      } else {
        await Linking.openURL(uri);
      }
    } catch {
      Alert.alert('PDF', 'Não foi possível abrir este PDF. Verifique a ligação e tente novamente.');
    }
    setOpening(false);
  };

  if (Platform.OS !== 'web' && NativePdf) {
    return (
      <View style={[styles.pdfReaderContainer, { backgroundColor: colors.card }]}>
        <NativePdf
          source={{ uri: cachedUri ?? uri, cache: true }}
          style={styles.pdfReader}
          trustAllCerts={false}
          spacing={12}
          fitPolicy={0}
          minScale={1}
          maxScale={3}
          horizontal={false}
          enablePaging={false}
          renderActivityIndicator={() => <ActivityIndicator color={colors.primary} size="large" />}
          onLoadComplete={(pages: number) => {
            setLoadError(null);
            if (pages <= 1) onReachedEnd?.();
          }}
          onPageChanged={(page: number, pages: number) => {
            if (pages > 0 && page >= pages) onReachedEnd?.();
          }}
          onError={(error: any) => setLoadError(error?.message ?? 'Não foi possível carregar este PDF.')}
        />
        {loadError ? (
          <View style={[styles.pdfErrorOverlay, { backgroundColor: colors.card }]}>
            <Ionicons name="document-text-outline" size={54} color={colors.primary} />
            <Text style={[styles.pdfTitle, { color: colors.text }]}>PDF indisponível</Text>
            <Text style={[styles.pdfText, { color: colors.textMuted }]}>{loadError}</Text>
            <TouchableOpacity style={[styles.pdfButton, { backgroundColor: colors.primary }]} onPress={openPdf} disabled={opening}>
              {opening ? <ActivityIndicator color="#fff" /> : <Ionicons name="open-outline" size={18} color="#fff" />}
              <Text style={styles.pdfButtonText}>{opening ? 'A preparar...' : 'Abrir PDF'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <CrossPlatformWebView
      source={{ uri }}
      style={{ flex: 1, backgroundColor: colors.card }}
      startInLoadingState
    />
  );
}

const gameStyles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingCard: {
    minWidth: 170,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  loadingTitle: { fontSize: 14, fontWeight: '800' },
});

// ------------------------------------------------------------
// Main LessonViewerScreen
// ------------------------------------------------------------
export default function LessonViewerScreen({ route, navigation }: any) {
  useKeepAwake();
  const { colors: themeColors, isDark } = useTheme();
  const { lesson: routeLesson, lessonId: routeLessonId, courseId } = route.params as { lesson?: Lesson; lessonId?: string; courseId: string };
  const initialLessonId = routeLessonId ?? routeLesson?.id ?? '';
  const [lessonParam, setLessonParam] = useState<Lesson>(routeLesson ?? {
    id: initialLessonId,
    title: 'A carregar...',
    contentType: 'TEXT',
    textContent: '',
  });
  const [lessonLoading, setLessonLoading] = useState(!hasFullLessonPayload(routeLesson));
  const [lessonError, setLessonError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const lessonMediaUrl = lessonParam.contentType === 'AUDIO' ? lessonParam.audioUrl : lessonParam.videoUrl;
  const initialTranscript = lessonParam.contentType === 'VIDEO' || lessonParam.contentType === 'AUDIO'
    ? isSameMediaSource(lessonParam.transcriptSourceUrl, lessonMediaUrl) ? cleanTranscriptText(lessonParam.textContent) : ''
    : cleanTranscriptText(lessonParam.textContent);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [transcribing, setTranscribing] = useState(false);
  const [mediaTime, setMediaTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(lessonParam.duration ?? 0);
  const [cachedMediaUri, setCachedMediaUri] = useState<string | null>(null);
  const transcriptScrollRef = useRef<ScrollView | null>(null);
  const transcriptSegmentLayouts = useRef<Record<number, { y: number; height: number }>>({});
  const [transcriptViewportHeight, setTranscriptViewportHeight] = useState(0);
  const [transcriptLayoutVersion, setTranscriptLayoutVersion] = useState(0);
  // Anti-cheat countdown
  const [countdown, setCountdown] = useState<number>(getRequiredLessonSeconds(lessonParam));
  const countdownRef = useRef<any>(null);
  const [htmlContentReady, setHtmlContentReady] = useState(lessonParam.contentType !== 'HTML');
  const autoCompletedLessonRef = useRef<string | null>(null);
  const autoTranscriptStartedRef = useRef<string | null>(null);

  const transcriptSegments = splitTranscriptIntoSegments(
    transcript,
    mediaDuration || lessonParam.duration || lessonParam.minDuration || 0
  );
  const transcriptHighlightTime = Math.min(
    mediaDuration || lessonParam.duration || Number.MAX_SAFE_INTEGER,
    mediaTime + TRANSCRIPT_HIGHLIGHT_LEAD_SECONDS
  );
  const activeTranscriptIndex = transcriptSegments.findIndex((segment) => (
    transcriptHighlightTime >= segment.start && transcriptHighlightTime < segment.end
  ));
  const safeActiveTranscriptIndex = activeTranscriptIndex >= 0
    ? activeTranscriptIndex
    : transcriptHighlightTime > 0 && transcriptSegments.length > 0
    ? transcriptSegments.length - 1
    : -1;
  const reachedLastTranscriptBlock = transcriptSegments.length > 0
    && safeActiveTranscriptIndex === transcriptSegments.length - 1;
  const reachedMediaEnd = mediaDuration > 0 && mediaTime >= Math.max(0, mediaDuration - 2);
  const watchedEnoughVideo = lessonParam.contentType !== 'VIDEO' || (
    mediaDuration > 0
    && mediaTime >= Math.max(0, mediaDuration - 3)
    && mediaTime >= Math.min(15, mediaDuration * 0.8)
  );
  const canCompleteVideoLesson = lessonParam.contentType !== 'VIDEO' || watchedEnoughVideo;
  const shouldShowCompleteButton = lessonParam.contentType === 'VIDEO';
  const countdownBlocksCompletion = countdown > 0 && lessonParam.contentType === 'VIDEO';
  const completeButtonDisabled = completed || marking || countdownBlocksCompletion || !canCompleteVideoLesson;
  const androidNavigationInset = Platform.OS === 'android' ? Math.max(insets.bottom, 28) : insets.bottom;
  const lessonFooterBottom = Platform.OS === 'android' ? androidNavigationInset : Math.max(insets.bottom, 12);
  const mediaProgressLabel = mediaDuration > 0
    ? `${formatDuration(mediaTime)} / ${formatDuration(mediaDuration)}`
    : mediaTime > 0
    ? `${formatDuration(mediaTime)} assistidos`
    : 'A preparar progresso';
  const currentVideoUrl = lessonParam.contentType === 'VIDEO' ? lessonParam.videoUrl : null;
  const ytId = useMemo(() => extractYouTubeId(currentVideoUrl), [currentVideoUrl]);
  const resolvedVideoUrl = useMemo(() => resolveMediaUrl(currentVideoUrl), [currentVideoUrl]);
  const playableVideoUrl = useMemo(
    () => shouldUseCachedVideoUri(cachedMediaUri, resolvedVideoUrl) ? cachedMediaUri : resolvedVideoUrl,
    [cachedMediaUri, resolvedVideoUrl]
  );
  const youtubeEmbedHtml = useMemo(() => {
    if (!ytId) return '';
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body,#player{width:100%;height:100%;background:#000;overflow:hidden}</style></head><body><div id="player"></div><script src="https://www.youtube.com/iframe_api"></script><script>let player;let timer;function send(payload){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(payload));}function report(){if(!player||!player.getCurrentTime)return;send({type:'media-time',currentTime:player.getCurrentTime()||0,duration:player.getDuration()||0});}function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'100%',height:'100%',videoId:'${ytId}',playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1,controls:1},events:{onReady:function(){send({type:'media-duration',duration:player.getDuration()||0});player.playVideo();timer=setInterval(report,500);},onStateChange:report}});}window.addEventListener('beforeunload',function(){if(timer)clearInterval(timer);});</script></body></html>`;
  }, [ytId]);
  const webVideoHtml = useMemo(() => {
    if (!resolvedVideoUrl) return '';
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;display:flex;align-items:center;justify-content:center;height:100vh;width:100vw}video{width:100%;max-height:100%;outline:none}</style></head><body><video id="media" controls autoplay playsinline preload="metadata"><source src="${resolvedVideoUrl}"></video><script>const media=document.getElementById('media');function send(payload){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(payload));}function report(){send({type:'media-time',currentTime:media.currentTime||0,duration:media.duration||0});}media.addEventListener('loadedmetadata',()=>send({type:'media-duration',duration:media.duration||0}));media.addEventListener('timeupdate',report);media.addEventListener('seeked',report);media.addEventListener('pause',report);media.addEventListener('play',report);media.addEventListener('ended',report);const timer=setInterval(report,500);window.addEventListener('beforeunload',()=>clearInterval(timer));media.play().catch(()=>{});</script></body></html>`;
  }, [resolvedVideoUrl]);
  const videoWebViewSource = useMemo(() => {
    if (ytId && youtubeEmbedHtml) return { html: youtubeEmbedHtml };
    if (webVideoHtml) return { html: webVideoHtml };
    return { html: '<!DOCTYPE html><html><body style="margin:0;background:#000"></body></html>' };
  }, [ytId, youtubeEmbedHtml, webVideoHtml]);

  useEffect(() => {
    transcriptSegmentLayouts.current = {};
    setTranscriptLayoutVersion((version) => version + 1);
  }, [transcript, mediaDuration]);

  useEffect(() => {
    const id = routeLessonId ?? routeLesson?.id;
    let active = true;

    if (!id) {
      setLessonLoading(false);
      setLessonError('Lição não encontrada.');
      return () => { active = false; };
    }

    if (hasFullLessonPayload(routeLesson)) {
      setLessonParam(routeLesson as Lesson);
      setLessonLoading(false);
      setLessonError(null);
      return () => { active = false; };
    }

    setLessonLoading(true);
    setLessonError(null);
    getPersistentCached<Lesson>(`/courses/lessons/${id}`, 30 * 60 * 1000)
      .then((lesson) => {
        if (!active) return;
        setLessonParam(lesson);
        setLessonError(null);
      })
      .catch(() => {
        if (!active) return;
        setLessonError('Não foi possível carregar esta lição. Verifique a ligação e tente novamente.');
      })
      .finally(() => {
        if (active) setLessonLoading(false);
      });

    return () => { active = false; };
  }, [routeLessonId, routeLesson?.id]);

  useEffect(() => {
    setTranscript(initialTranscript);
    setMediaDuration(lessonParam.duration ?? 0);
    setMediaTime(0);
    setCountdown(getRequiredLessonSeconds(lessonParam));
    setCompleted(false);
    setHtmlContentReady(lessonParam.contentType !== 'HTML');
  }, [lessonParam.id, initialTranscript]);

  useEffect(() => {
    const resolved = resolveMediaUrl(lessonMediaUrl);
    let active = true;
    setMediaTime(0);
    setCachedMediaUri(null);
    if (lessonLoading || !resolved || (lessonParam.contentType !== 'VIDEO' && lessonParam.contentType !== 'AUDIO')) return;

    getCachedMediaUri(resolved).then((local) => {
      if (active && local) setCachedMediaUri(local);
      if (local || !active) return;
      cacheMediaInBackground(resolved).then((downloaded) => {
        if (active && downloaded) setCachedMediaUri(downloaded);
      });
    });
    return () => { active = false; };
  }, [lessonParam.id, lessonMediaUrl, lessonParam.contentType, lessonLoading]);

  useEffect(() => {
    if (lessonLoading || !lessonParam.id) return;
    // Signal to backend that the lesson was opened
    api.post(`/progress/lesson/${lessonParam.id}/start`).catch(() => {});

    // Start countdown only for video lessons that require a minimum duration.
    const min = getRequiredLessonSeconds(lessonParam);
    if (min > 0) {
      setCountdown(min);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [lessonParam.id, lessonLoading]);

  useEffect(() => {
    if (safeActiveTranscriptIndex < 0) return;
    const activeLayout = transcriptSegmentLayouts.current[safeActiveTranscriptIndex];
    if (!activeLayout) return;

    const topComfortOffset = transcriptViewportHeight > 0
      ? Math.min(36, Math.max(12, transcriptViewportHeight * 0.1))
      : 12;
    transcriptScrollRef.current?.scrollTo({
      y: Math.max(0, activeLayout.y - topComfortOffset),
      animated: true,
    });
  }, [safeActiveTranscriptIndex, transcriptViewportHeight, transcriptLayoutVersion]);

  const handleTranscriptScrollLayout = (event: LayoutChangeEvent) => {
    setTranscriptViewportHeight(event.nativeEvent.layout.height);
  };

  const handleTranscriptSegmentLayout = (index: number, event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const previous = transcriptSegmentLayouts.current[index];
    if (previous && Math.abs(previous.y - y) < 1 && Math.abs(previous.height - height) < 1) return;

    transcriptSegmentLayouts.current[index] = { y, height };
    setTranscriptLayoutVersion((version) => version + 1);
  };

  const handleMediaMessage = (event: any) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data ?? '{}');
      if (data.type === 'media-time') {
        if (Number.isFinite(data.currentTime)) setMediaTime(data.currentTime);
        if (Number.isFinite(data.duration) && data.duration > 0) setMediaDuration(data.duration);
      }
      if (data.type === 'media-duration' && Number.isFinite(data.duration) && data.duration > 0) {
        setMediaDuration(data.duration);
      }
    } catch {}
  };

  const handleNativePlaybackTime = (currentTime: number, duration: number) => {
    if (Number.isFinite(currentTime)) setMediaTime(currentTime);
    if (Number.isFinite(duration) && duration > 0) setMediaDuration(duration);
  };

  const findNextUnlockedLesson = (courseData: any, progressData: any, currentLessonId: string) => {
    const unlockedModuleIds = new Set(
      (progressData?.modules ?? [])
        .filter((mod: any) => mod.isUnlocked)
        .map((mod: any) => mod.id)
    );
    const lessons = (courseData?.modules ?? []).flatMap((mod: any) =>
      (mod.lessons ?? []).map((lesson: any) => ({
        ...lesson,
        moduleId: lesson.moduleId ?? mod.id,
      }))
    );
    const currentIndex = lessons.findIndex((lesson: any) => lesson.id === currentLessonId);
    if (currentIndex < 0) return null;
    const nextLesson = lessons[currentIndex + 1] ?? null;
    if (!nextLesson || !unlockedModuleIds.has(nextLesson.moduleId)) return null;
    return nextLesson;
  };

  const openNextLessonOrReturn = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}?lessonScope=unlocked`),
        api.get(`/progress/course/${courseId}?lessonScope=unlocked`),
      ]);
      const nextLesson = findNextUnlockedLesson(courseRes.data, progressRes.data, lessonParam.id);
      if (nextLesson?.id) {
        navigation.replace('LessonViewer', {
          lesson: nextLesson,
          lessonId: nextLesson.id,
          courseId,
        });
        return;
      }
    } catch {}
    navigation.goBack();
  };

  const getCompleteButtonText = () => {
    if (completed) return 'Lição Concluída';
    if (countdownBlocksCompletion) return `Aguarda ${countdown}s`;
    if (lessonParam.contentType === 'VIDEO' && !canCompleteVideoLesson) return 'Assiste até ao fim';
    return 'Marcar como Concluída';
  };

  const markComplete = async ({ navigateAfter = true, silent = false }: { navigateAfter?: boolean; silent?: boolean } = {}) => {
    if (completed || marking || lessonLoading || lessonError) return;
    if (lessonParam.contentType === 'VIDEO' && !canCompleteVideoLesson) {
      Alert.alert('Continue a assistir', 'Para concluir, continua a assistir à aula.');
      return;
    }
    if (countdownBlocksCompletion) {
      Alert.alert('Aguarde', `Ainda tens de esperar ${countdown}s antes de concluir esta lição.`);
      return;
    }
    setMarking(true);
    try {
      await api.post(`/progress/lesson/${lessonParam.id}/complete`, {
        proof: {
          contentType: lessonParam.contentType,
          currentTime: mediaTime,
          duration: mediaDuration || lessonParam.duration || 0,
          watchedToEnd: canCompleteVideoLesson,
        },
      });
      setCompleted(true);
      if (navigateAfter) await openNextLessonOrReturn();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.error === 'anti_cheat') {
        if (!silent) Alert.alert('Demasiado rápido!', data.message ?? 'Passa mais tempo na lição antes de concluir.');
      } else if (!silent) {
        navigation.goBack();
      }
    }
    setMarking(false);
  };

  useEffect(() => {
    const canAutoComplete =
      !lessonLoading &&
      !lessonError &&
      lessonParam.id &&
      lessonParam.contentType !== 'VIDEO' &&
      lessonParam.contentType !== 'QUIZ' &&
      (lessonParam.contentType !== 'HTML' || htmlContentReady);

    if (!canAutoComplete || completed || marking || autoCompletedLessonRef.current === lessonParam.id) return;

    autoCompletedLessonRef.current = lessonParam.id;
    markComplete({ navigateAfter: false, silent: true });
  }, [lessonParam.id, lessonParam.contentType, lessonLoading, lessonError, htmlContentReady, completed, marking]);

  const runTranscriptGeneration = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (transcribing || lessonLoading || lessonError) return;
    setTranscribing(true);
    try {
      const res = await api.post(`/courses/lessons/${lessonParam.id}/transcribe`, {}, { timeout: 120000 });
      const nextTranscript = cleanTranscriptText(res.data.transcript);
      if (!nextTranscript && !silent) {
        Alert.alert('Transcrição', 'Não foi possível gerar texto útil para esta aula.');
      }
      setTranscript(nextTranscript);
    } catch (err: any) {
      if (!silent) {
        Alert.alert('Transcrição', err?.response?.data?.error ?? 'Não foi possível gerar a transcrição.');
      }
    }
    setTranscribing(false);
  }, [lessonError, lessonLoading, lessonParam.id, transcribing]);

  useEffect(() => {
    const shouldAutoGenerate =
      lessonParam.contentType === 'VIDEO' &&
      !!lessonParam.id &&
      !lessonLoading &&
      !lessonError &&
      !transcribing &&
      !transcript.trim() &&
      autoTranscriptStartedRef.current !== lessonParam.id;

    if (!shouldAutoGenerate) return;
    autoTranscriptStartedRef.current = lessonParam.id;
    runTranscriptGeneration({ silent: true });
  }, [lessonParam.contentType, lessonParam.id, lessonLoading, lessonError, runTranscriptGeneration, transcript, transcribing]);

  const generateTranscript = async () => {
    if (transcribing || lessonLoading || lessonError) return;
    Alert.alert(
      'Gerar transcrição?',
      'A transcrição automática pode demorar até 2 minutos. Gere apenas se precisar dela agora.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar',
          onPress: async () => {
            setTranscribing(true);
            try {
              const res = await api.post(`/courses/lessons/${lessonParam.id}/transcribe`, {}, { timeout: 120000 });
              const nextTranscript = cleanTranscriptText(res.data.transcript);
              if (!nextTranscript) {
                Alert.alert('Transcrição', 'Não foi possível gerar texto útil para esta aula.');
              }
              setTranscript(nextTranscript);
            } catch (err: any) {
              Alert.alert('Transcrição', err?.response?.data?.error ?? 'Não foi possível gerar a transcrição.');
            }
            setTranscribing(false);
          },
        },
      ]
    );
  };

  const renderTranscriptPanel = () => (
    <View style={[styles.transcriptPanel, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <View style={styles.transcriptHeader}>
        <Text style={[styles.transcriptTitle, { color: themeColors.text }]}>Transcrição</Text>
        {!transcript.trim() && (
          <TouchableOpacity
            style={[styles.transcriptBtn, { backgroundColor: themeColors.primary }, transcribing && { opacity: 0.7 }]}
            onPress={generateTranscript}
            disabled={transcribing}
          >
            {transcribing ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.transcriptBtnText}>A gerar</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={14} color="#fff" />
                <Text style={styles.transcriptBtnText}>Gerar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      {transcript.trim() ? (
        <ScrollView
          ref={transcriptScrollRef}
          style={styles.transcriptScroll}
          contentContainerStyle={styles.transcriptScrollContent}
          showsVerticalScrollIndicator
          onLayout={handleTranscriptScrollLayout}
        >
          {transcriptSegments.map((segment, index) => {
            const active = index === safeActiveTranscriptIndex;
            return (
              <Text
                key={segment.id}
                onLayout={(event) => handleTranscriptSegmentLayout(index, event)}
                style={[
                  styles.transcriptSegment,
                  {
                    color: active ? themeColors.primary : themeColors.text,
                    backgroundColor: active ? `${themeColors.primary}18` : 'transparent',
                  },
                  active && styles.transcriptSegmentActive,
                ]}
              >
                {segment.text}
              </Text>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={[styles.transcriptEmpty, { color: themeColors.textMuted }]}>
          {transcribing ? 'A gerar transcrição automática. Isto pode demorar um pouco em vídeos maiores.' : 'Gere uma transcrição automática desta aula para aparecer aqui.'}
        </Text>
      )}
    </View>
  );

  const renderContent = () => {
    if (lessonLoading) {
      return (
        <View style={styles.placeholder}>
          <ActivityIndicator color={themeColors.primary} size="large" />
          <Text style={[styles.placeholderText, { color: themeColors.textMuted, marginTop: 12 }]}>A carregar lição...</Text>
        </View>
      );
    }

    if (lessonError) {
      return (
        <View style={styles.placeholder}>
          <Ionicons name="alert-circle-outline" size={28} color={themeColors.textMuted} style={{ marginBottom: 8 }} />
          <Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>{lessonError}</Text>
        </View>
      );
    }

    switch (lessonParam.contentType) {
      case 'VIDEO': {
        if (!lessonParam.videoUrl) {
          return (
            <View style={styles.placeholder}>
              <Ionicons name="videocam-outline" size={24} color={themeColors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>Sem vídeo disponível</Text>
            </View>
          );
        }

        return (
          <View style={styles.lessonMediaContent}>
            <View style={{ backgroundColor: '#000', width: '100%', aspectRatio: 16 / 9 }}>
              {ytId && Platform.OS === 'web' ? (
                <YouTubeWebPlayer
                  videoId={ytId}
                  duration={lessonParam.duration || lessonParam.minDuration || 60}
                  onPlaybackTime={handleNativePlaybackTime}
                />
              ) : ytId || Platform.OS === 'web' ? (
                <CrossPlatformWebView
                  source={videoWebViewSource}
                  style={{ flex: 1 }}
                  allowsFullscreenVideo
                  javaScriptEnabled
                  onMessage={handleMediaMessage}
                />
              ) : playableVideoUrl ? (
                <NativeVideoPlayer uri={playableVideoUrl} onPlaybackTime={handleNativePlaybackTime} />
              ) : null}
            </View>
            {renderTranscriptPanel()}
          </View>
        );
      }

      case 'AUDIO': {
        const resolvedAudioUrl = resolveMediaUrl(lessonParam.audioUrl);
        const playableAudioUrl = cachedMediaUri || resolvedAudioUrl;
        return (
          <View style={styles.lessonMediaContent}>
            {playableAudioUrl ? (
              Platform.OS === 'web' ? (
                <WebAudioPlayer
                  uri={playableAudioUrl}
                  title={lessonParam.title}
                  color={themeColors.text}
                  mutedColor={themeColors.textMuted}
                  onPlaybackTime={handleNativePlaybackTime}
                />
              ) : (
                <NativeAudioPlayer
                  uri={playableAudioUrl}
                  title={lessonParam.title}
                  color={themeColors.text}
                  mutedColor={themeColors.textMuted}
                  onPlaybackTime={handleNativePlaybackTime}
                />
              )
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="headset-outline" size={24} color={themeColors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>Áudio não disponível</Text>
              </View>
            )}
            {renderTranscriptPanel()}
          </View>
        );
      }

      case 'PDF':
        if (!lessonParam.pdfUrl) return <View style={styles.placeholder}><Ionicons name="document-text-outline" size={24} color={themeColors.textMuted} style={{ marginBottom: 8 }}/><Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>Sem PDF disponível</Text></View>;
        return <PdfPanel uri={resolveMediaUrl(lessonParam.pdfUrl)!} colors={themeColors} />;

      case 'HTML': {
        const webviewSource = getHtmlWebViewSource(lessonParam.htmlContent);

        if (!webviewSource) {
          return <View style={styles.placeholder}><Ionicons name="game-controller-outline" size={24} color={themeColors.textMuted} style={{ marginBottom: 8 }}/><Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>Sem jogo disponível</Text></View>;
        }

        return (
          <View
            style={{ flex: 1, paddingBottom: androidNavigationInset }}
          >
            <GameWebView
              source={webviewSource}
              onReady={() => setHtmlContentReady(true)}
            />
          </View>
        );
      }

      case 'TEXT': {
        const htmlBody = lessonParam.textContent
          ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
              body{font-family:-apple-system,sans-serif;font-size:16px;line-height:1.7;color:${isDark ? '#e2e8f0' : '#1e293b'};padding:20px;max-width:100%;background:${isDark ? '#0f172a' : '#fff'};}
              h1,h2,h3{color:${isDark ? '#f8fafc' : '#0f172a'};margin:1em 0 0.4em;}
              h2{font-size:1.3em;} h3{font-size:1.1em;}
              p{margin:0 0 1em;} ul,ol{padding-left:1.4em;margin-bottom:1em;} li{margin-bottom:0.3em;}
              strong{font-weight:700;} em{font-style:italic;} u{text-decoration:underline;}
              blockquote{border-left:4px solid #14b8a6;padding:8px 12px;margin:1em 0;background:${isDark ? '#064e3b' : '#f0fdfa'};color:${isDark ? '#34d399' : '#0f766e'};border-radius:4px;}
            </style></head><body>${lessonParam.textContent}</body></html>`
          : `<p>Sem conteúdo.</p>`;
        return (
          <CrossPlatformWebView
            source={{ html: htmlBody }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            javaScriptEnabled
          />
        );
      }

      case 'QUIZ':
        if (lessonParam.quiz) {
          return <QuizRenderer quiz={lessonParam.quiz as any} onComplete={markComplete} />;
        }
        return <View style={styles.placeholder}><Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>Quiz não disponível</Text></View>;

      default:
        return <View style={styles.placeholder}><Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>Tipo de conteúdo desconhecido</Text></View>;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>{lessonParam.title}</Text>
        {countdownBlocksCompletion ? (
          <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={12} color="#B45309" />
            <Text style={{ color: '#B45309', fontWeight: 'bold', fontSize: 12, marginLeft: 4 }}>{countdown}s</Text>
          </View>
        ) : (
          <View style={[styles.typeBadge, { backgroundColor: isDark ? '#1e1b4b' : '#EEF2FF' }]}>
            <Text style={[styles.typeBadgeText, { color: themeColors.primary }]}>{CONTENT_TYPE_LABELS[lessonParam.contentType] ?? lessonParam.contentType}</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {shouldShowCompleteButton && !lessonLoading && !lessonError && (
        <TouchableOpacity
          style={[
            styles.completeBtn,
            { backgroundColor: themeColors.primary, marginBottom: lessonFooterBottom },
            completed && { backgroundColor: themeColors.success },
            completeButtonDisabled && !completed && { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
            countdownBlocksCompletion && { opacity: 0.5 },
          ]}
          onPress={() => markComplete()}
          disabled={completeButtonDisabled || lessonLoading || !!lessonError}
          accessibilityLabel={getCompleteButtonText()}
        >
          {marking ? <ActivityIndicator color="#fff" /> : (
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={[styles.completeBtnText, { color: '#fff' }]}>
                {getCompleteButtonText()}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontWeight: 'bold', fontSize: 11 },
  lessonMediaContent: { flex: 1 },
  mediaLoadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  mediaLoadingText: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 10 },
  youtubeFrameWrap: { flex: 1, backgroundColor: '#000' },
  audioContainer: { alignItems: 'center', padding: 32, width: '100%' },
  audioIcon: { fontSize: 64, marginBottom: 16 },
  audioTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  nativeAudioBox: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 26, width: '100%' },
  nativeAudioControls: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  webAudioControlWrap: { width: '100%', maxWidth: 520 },
  audioPlayBtn: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  audioProgressWrap: { flex: 1 },
  audioProgressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', opacity: 0.35 },
  audioProgressFill: { height: '100%', borderRadius: 4 },
  audioTime: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  pdfReaderContainer: { flex: 1, overflow: 'hidden', paddingTop: 12, paddingHorizontal: 6 },
  pdfReader: { flex: 1, width: '100%', height: '100%', backgroundColor: 'transparent' },
  pdfErrorOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 28 },
  pdfPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  pdfTitle: { fontSize: 20, fontWeight: '800', marginTop: 14, marginBottom: 8 },
  pdfText: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 22 },
  pdfButton: { minWidth: 180, borderRadius: 28, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  pdfButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  pdfLinkButton: { padding: 14 },
  pdfLinkText: { fontWeight: '700' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  placeholderText: { fontSize: 16, textAlign: 'center' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, paddingVertical: 14, borderRadius: 30, gap: 8 },
  completeBtnText: { fontWeight: 'bold', fontSize: 16 },
  transcriptPanel: { flex: 1, borderTopWidth: 1, paddingHorizontal: 18, paddingTop: 16 },
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  transcriptTitle: { fontSize: 16, fontWeight: '800' },
  transcriptBtn: { minWidth: 78, height: 34, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12 },
  transcriptBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  transcriptScroll: { flex: 1 },
  transcriptScrollContent: { paddingBottom: 16 },
  transcriptSegment: { fontSize: 14, lineHeight: 21, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, marginBottom: 4 },
  transcriptSegmentActive: { fontWeight: '700' },
  transcriptEmpty: { fontSize: 14, lineHeight: 21 },
  mediaProgressPanel: { borderTopWidth: 1, paddingHorizontal: 18, paddingVertical: 10 },
  mediaProgressText: { fontSize: 12, fontWeight: '700', lineHeight: 18 },
});
