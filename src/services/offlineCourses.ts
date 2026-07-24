import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import { AppState, Platform } from 'react-native';

import api from './api';
import { getStoredAuthToken } from './secure-storage';
import {
  ensureOfflineMediaDirectory,
  offlinePathForUrl,
  registerOfflineMedia,
  removeOfflineMedia,
  resolveMediaUrl,
} from '../utils/mediaCache';

const MANIFEST_KEY = 'maza_offline_courses';
const CURRENT_MANIFEST_VERSION = 3;

export type OfflineDownloadStatus =
  | 'preparing'
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'waiting'
  | 'completed'
  | 'error';

export type OfflineMediaItem = {
  url: string;
  resolvedUrl: string;
  fileUri: string;
  label: string;
  kind: 'video' | 'audio' | 'pdf' | 'activity';
  status: 'pending' | 'downloading' | 'completed';
  bytesWritten: number;
  totalBytes: number;
  resumeData?: string;
};

export type OfflineCourseManifest = {
  courseId: string;
  title: string;
  downloadedAt?: string;
  updatedAt: string;
  status: OfflineDownloadStatus;
  manifestVersion: number;
  course?: any;
  items: OfflineMediaItem[];
  mediaUrls: string[];
  completedFiles: number;
  availableFiles: number;
  totalFiles: number;
  bytesWritten: number;
  totalBytes: number;
  progress: number;
  localCompletedLessonIds: string[];
  contentSummary: {
    videos: number;
    audios: number;
    pdfs: number;
    activities: number;
  };
  error?: string;
};

type Records = Record<string, OfflineCourseManifest>;
type Listener = (records: Records) => void;

let recordsCache: Records | null = null;
let initializePromise: Promise<void> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let networkAvailable = true;
const listeners = new Set<Listener>();
const runningCourses = new Set<string>();
const activeTasks = new Map<string, FileSystem.DownloadResumable>();

function nowIso() {
  return new Date().toISOString();
}

function snapshot(records: Records): Records {
  return Object.fromEntries(Object.entries(records).map(([key, value]) => [key, { ...value, items: [...value.items] }]));
}

function emit() {
  if (!recordsCache) return;
  const current = snapshot(recordsCache);
  listeners.forEach((listener) => listener(current));
}

function schedulePersist(immediate = false) {
  if (!recordsCache) return;
  if (persistTimer) clearTimeout(persistTimer);

  const write = () => {
    persistTimer = null;
    if (recordsCache) AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(recordsCache)).catch(() => {});
  };

  if (immediate) write();
  else persistTimer = setTimeout(write, 350);
}

function publish(record: OfflineCourseManifest, immediate = false) {
  if (!recordsCache) recordsCache = {};
  record.updatedAt = nowIso();
  recordsCache[record.courseId] = record;
  schedulePersist(immediate);
  emit();
}

function isCoursePaused(courseId: string) {
  return recordsCache?.[courseId]?.status === 'paused';
}

function normalizeRecord(value: any): OfflineCourseManifest {
  const totalFiles = Number(value.totalFiles ?? value.mediaUrls?.length ?? 0);
  const completedFiles = Number(value.completedFiles ?? value.availableFiles ?? 0);
  const manifestVersion = Number(value.manifestVersion ?? 0);
  const storedStatus: OfflineDownloadStatus = value.status
    ?? (totalFiles > 0 && completedFiles >= totalFiles ? 'completed' : 'error');
  const needsUpgrade = manifestVersion < CURRENT_MANIFEST_VERSION && storedStatus === 'completed';
  const status: OfflineDownloadStatus = needsUpgrade ? 'error' : storedStatus;

  return {
    courseId: value.courseId,
    title: value.title ?? 'Curso',
    downloadedAt: value.downloadedAt,
    updatedAt: value.updatedAt ?? value.downloadedAt ?? nowIso(),
    status: ['preparing', 'queued', 'downloading'].includes(status) ? 'waiting' : status,
    manifestVersion,
    course: value.course,
    items: Array.isArray(value.items) ? value.items.map((item: any) => ({
      ...item,
      kind: item.kind ?? (String(item.label ?? '').toLowerCase().startsWith('audio')
        ? 'audio'
        : String(item.label ?? '').toLowerCase().startsWith('pdf')
          ? 'pdf'
          : String(item.label ?? '').toLowerCase().startsWith('atividade')
            ? 'activity'
            : 'video'),
    })) : [],
    mediaUrls: Array.isArray(value.mediaUrls) ? value.mediaUrls : [],
    completedFiles,
    availableFiles: completedFiles,
    totalFiles,
    bytesWritten: Number(value.bytesWritten ?? 0),
    totalBytes: Number(value.totalBytes ?? 0),
    progress: Number(value.progress ?? (totalFiles > 0 ? completedFiles / totalFiles : 0)),
    localCompletedLessonIds: Array.isArray(value.localCompletedLessonIds) ? value.localCompletedLessonIds : [],
    contentSummary: value.contentSummary ?? { videos: 0, audios: 0, pdfs: 0, activities: 0 },
    error: needsUpgrade ? 'Actualize para guardar todo o curso.' : value.error,
  };
}

async function readRecords(): Promise<Records> {
  if (recordsCache) return recordsCache;
  try {
    const parsed = JSON.parse(await AsyncStorage.getItem(MANIFEST_KEY) ?? '{}');
    recordsCache = Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, normalizeRecord(value)])
    );
  } catch {
    recordsCache = {};
  }
  return recordsCache;
}

function isConnected(state: Network.NetworkState) {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

function calculateProgress(record: OfflineCourseManifest, activeItem?: OfflineMediaItem) {
  const completed = record.items.filter((item) => item.status === 'completed');
  record.completedFiles = completed.length;
  record.availableFiles = completed.length;
  record.totalFiles = record.items.length;
  record.bytesWritten = record.items.reduce((sum, item) => sum + Math.max(0, item.bytesWritten), 0);
  record.totalBytes = record.items.reduce((sum, item) => sum + Math.max(0, item.totalBytes), 0);

  if (record.totalFiles === 0) {
    record.progress = 1;
    return;
  }

  const currentFraction = activeItem && activeItem.status !== 'completed' && activeItem.totalBytes > 0
    ? Math.min(1, activeItem.bytesWritten / activeItem.totalBytes)
    : 0;
  record.progress = Math.min(1, (record.completedFiles + currentFraction) / record.totalFiles);
}

function mediaLabel(lesson: any, fallback: string) {
  const type = String(lesson?.contentType ?? '').toUpperCase();
  if (type === 'VIDEO') return `Vídeo: ${lesson.title ?? fallback}`;
  if (type === 'AUDIO') return `Áudio: ${lesson.title ?? fallback}`;
  if (type === 'PDF') return `PDF: ${lesson.title ?? fallback}`;
  if (type === 'HTML') return `Atividade: ${lesson.title ?? fallback}`;
  return lesson?.title ?? fallback;
}

function collectMedia(course: any): Array<{ url: string; label: string; kind: OfflineMediaItem['kind'] }> {
  const media = new Map<string, { label: string; kind: OfflineMediaItem['kind'] }>();

  for (const module of course?.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const candidates = [
        { url: lesson.videoUrl, kind: 'video' as const },
        { url: lesson.audioUrl, kind: 'audio' as const },
        { url: lesson.pdfUrl, kind: 'pdf' as const },
        {
          url: typeof lesson.htmlContent === 'string' && /^(https?:|\/)/i.test(lesson.htmlContent)
            ? lesson.htmlContent
            : null,
          kind: 'activity' as const,
        },
      ].filter((candidate) => Boolean(candidate.url));
      candidates.forEach(({ url, kind }) => media.set(url as string, { label: mediaLabel(lesson, 'Conteúdo da aula'), kind }));
    }
  }

  return [...media.entries()].map(([url, value]) => ({ url, ...value }));
}

function getContentSummary(items: OfflineMediaItem[]) {
  return items.reduce((summary, item) => {
    if (item.kind === 'video') summary.videos += 1;
    if (item.kind === 'audio') summary.audios += 1;
    if (item.kind === 'pdf') summary.pdfs += 1;
    if (item.kind === 'activity') summary.activities += 1;
    return summary;
  }, { videos: 0, audios: 0, pdfs: 0, activities: 0 });
}

async function prepareCourse(record: OfflineCourseManifest, courseHint?: any) {
  if (!networkAvailable) {
    record.status = 'waiting';
    record.error = 'Aguardando ligacao a internet';
    publish(record, true);
    return false;
  }

  record.status = 'preparing';
  record.error = undefined;
  record.progress = 0;
  publish(record, true);

  try {
    const response = await api.get(`/courses/${record.courseId}/offline-manifest`);
    const freshCourse = response.data ?? courseHint;
    const media = collectMedia(freshCourse);
    const previousItems = new Map(record.items.map((item) => [item.url, item]));
    record.course = freshCourse;
    record.manifestVersion = Number(freshCourse?.offlineAccess?.version ?? CURRENT_MANIFEST_VERSION);
    record.items = await Promise.all(media.map(async ({ url, label, kind }) => {
      const resolvedUrl = resolveMediaUrl(url) ?? url;
      const previous = previousItems.get(url);
      const fileUri = previous?.fileUri ?? offlinePathForUrl(resolvedUrl);
      const fileInfo = previous?.status === 'completed'
        ? await FileSystem.getInfoAsync(fileUri).catch(() => null)
        : null;
      const available = !!fileInfo?.exists;
      const availableBytes = available && 'size' in fileInfo ? Number(fileInfo.size ?? previous?.bytesWritten ?? 0) : 0;
      return {
        url,
        resolvedUrl,
        fileUri,
        label,
        kind,
        status: available ? 'completed' as const : 'pending' as const,
        bytesWritten: availableBytes,
        totalBytes: availableBytes,
      };
    }));
    record.mediaUrls = media.map((item) => item.url);
    record.contentSummary = getContentSummary(record.items);
    calculateProgress(record);
    record.error = undefined;
    publish(record, true);
    return true;
  } catch {
    record.status = networkAvailable ? 'error' : 'waiting';
    record.error = networkAvailable
      ? 'Nao foi possivel preparar o curso. Tente novamente.'
      : 'Aguardando ligacao a internet';
    publish(record, true);
    return false;
  }
}

async function runCourseDownload(courseId: string) {
  const records = await readRecords();
  const record = records[courseId];
  if (!record || runningCourses.has(courseId) || record.status === 'paused' || record.status === 'completed') return;
  if (!record.course || record.items.length === 0) return;
  if (!networkAvailable) {
    record.status = 'waiting';
    record.error = 'Aguardando ligacao a internet';
    publish(record, true);
    return;
  }

  runningCourses.add(courseId);
  record.status = 'downloading';
  record.error = undefined;
  publish(record, true);

  try {
    const token = await getStoredAuthToken();
    for (const item of record.items) {
      if (isCoursePaused(courseId)) break;
      if (item.status === 'completed') continue;
      if (!networkAvailable) {
        record.status = 'waiting';
        record.error = 'Aguardando ligacao a internet';
        publish(record, true);
        break;
      }

      item.status = 'downloading';
      calculateProgress(record, item);
      publish(record);

      const task = FileSystem.createDownloadResumable(
        item.resolvedUrl,
        item.fileUri,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
        },
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          item.bytesWritten = Math.max(0, totalBytesWritten);
          item.totalBytes = Math.max(0, totalBytesExpectedToWrite);
          calculateProgress(record, item);
          publish(record);
        },
        item.resumeData
      );

      activeTasks.set(courseId, task);
      try {
        const result = item.resumeData ? await task.resumeAsync() : await task.downloadAsync();
        if (isCoursePaused(courseId)) break;
        if (!result || result.status < 200 || result.status >= 300) {
          throw new Error(`Download HTTP ${result?.status ?? 'unknown'}`);
        }

        const info = await FileSystem.getInfoAsync(item.fileUri);
        const size = info.exists && 'size' in info ? Number(info.size ?? item.bytesWritten) : item.bytesWritten;
        item.bytesWritten = size;
        item.totalBytes = size;
        item.resumeData = undefined;
        item.status = 'completed';
        await registerOfflineMedia(item.url, item.fileUri);
        calculateProgress(record);
        publish(record, true);
      } catch {
        if (isCoursePaused(courseId)) break;
        item.status = 'pending';
        const savable = task.savable();
        item.resumeData = savable.resumeData ?? item.resumeData;
        record.status = networkAvailable ? 'error' : 'waiting';
        record.error = networkAvailable
          ? `Nao foi possivel transferir ${item.label}. Toque para tentar novamente.`
          : 'Aguardando ligacao a internet';
        publish(record, true);
        break;
      } finally {
        activeTasks.delete(courseId);
      }
    }

    if (record.items.every((item) => item.status === 'completed')) {
      record.status = 'completed';
      record.downloadedAt = nowIso();
      record.error = undefined;
      calculateProgress(record);
      record.progress = 1;
      publish(record, true);
    }
  } finally {
    runningCourses.delete(courseId);
  }
}

async function resumeEligibleDownloads() {
  const records = await readRecords();
  if (!networkAvailable) return;
  Object.values(records)
    .filter((record) => ['waiting', 'queued', 'downloading'].includes(record.status))
    .forEach((record) => {
      if (record.items.length === 0) void resumeCourseDownload(record.courseId);
      else void runCourseDownload(record.courseId);
    });
}

export async function initializeOfflineDownloads() {
  if (initializePromise) return initializePromise;
  initializePromise = (async () => {
    await ensureOfflineMediaDirectory();
    const records = await readRecords();
    const state = await Network.getNetworkStateAsync().catch(() => ({} as Network.NetworkState));
    networkAvailable = isConnected(state);

    Object.values(records).forEach((record) => {
      if (['preparing', 'queued', 'downloading'].includes(record.status)) {
        record.status = networkAvailable ? 'queued' : 'waiting';
      }
    });
    schedulePersist(true);
    emit();

    Network.addNetworkStateListener((nextState) => {
      const wasAvailable = networkAvailable;
      networkAvailable = isConnected(nextState);
      if (!wasAvailable && networkAvailable) void resumeEligibleDownloads();
    });

    AppState.addEventListener('change', (stateName) => {
      if (stateName === 'active') void resumeEligibleDownloads();
    });

    if (networkAvailable) void resumeEligibleDownloads();
  })();
  return initializePromise;
}

export function subscribeOfflineDownloads(listener: Listener) {
  listeners.add(listener);
  void readRecords().then(() => emit());
  return () => { listeners.delete(listener); };
}

export async function listOfflineCourses() {
  return Object.values(await readRecords());
}

export async function getOfflineCourse(courseId: string) {
  const record = (await readRecords())[courseId];
  return record?.status === 'completed' ? record : null;
}

export async function getOfflineDownload(courseId: string) {
  return (await readRecords())[courseId] ?? null;
}

function applyLocalCourseProgress(record: OfflineCourseManifest) {
  if (!record.course) return null;
  const completedIds = new Set(record.localCompletedLessonIds ?? []);
  const sourceModules = record.course.modules ?? [];
  const completedMedia = new Map<string, string>();
  record.items.forEach((item) => {
    if (item.status !== 'completed' || !item.fileUri) return;
    completedMedia.set(item.url, item.fileUri);
    completedMedia.set(item.resolvedUrl, item.fileUri);
  });

  const withOfflineMedia = (lesson: any) => {
    const localUri = (value: unknown) => {
      if (typeof value !== 'string' || !value) return value;
      return completedMedia.get(value)
        ?? completedMedia.get(resolveMediaUrl(value) ?? value)
        ?? value;
    };

    return {
      ...lesson,
      videoUrl: localUri(lesson.videoUrl),
      audioUrl: localUri(lesson.audioUrl),
      pdfUrl: localUri(lesson.pdfUrl),
      htmlContent: localUri(lesson.htmlContent),
    };
  };

  let nextModuleUnlocked = record.course.offlineAccess
    ? record.course.offlineAccess.baselineCompleted !== false
    : sourceModules[0]?.isUnlocked !== false;

  const modules = sourceModules.map((module: any) => {
    const isUnlocked = nextModuleUnlocked;
    const lessons = (module.lessons ?? []).map((lesson: any) => ({
      ...withOfflineMedia(lesson),
      isCompleted: !!lesson.isCompleted || completedIds.has(lesson.id),
    }));
    const isCompleted = lessons.length > 0 && lessons.every((lesson: any) => lesson.isCompleted);
    nextModuleUnlocked = nextModuleUnlocked && isCompleted;
    return { ...module, lessons, isUnlocked, isCompleted };
  });

  return { ...record.course, modules };
}

export async function getOfflineCourseSnapshot(courseId: string) {
  const record = (await readRecords())[courseId];
  return record ? applyLocalCourseProgress(record) : null;
}

export async function getOfflineLesson(courseId: string | undefined, lessonId: string) {
  if (!courseId) return null;
  const record = (await readRecords())[courseId];
  const course = record ? applyLocalCourseProgress(record) : null;
  for (const module of course?.modules ?? []) {
    const lesson = module.lessons?.find((candidate: any) => candidate.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

export async function markOfflineLessonCompleted(courseId: string, lessonId: string) {
  const record = (await readRecords())[courseId];
  if (!record) return null;
  if (!record.localCompletedLessonIds.includes(lessonId)) {
    record.localCompletedLessonIds.push(lessonId);
    publish(record, true);
  }
  return applyLocalCourseProgress(record);
}

export async function startCourseDownload(course: any) {
  if (Platform.OS === 'web') return null;
  await initializeOfflineDownloads();
  const courseId = course?.id ?? course?.courseId;
  if (!courseId) throw new Error('Curso invalido');

  const records = await readRecords();
  const existing = records[courseId];
  const needsManifestRefresh = !existing || existing.manifestVersion < CURRENT_MANIFEST_VERSION;
  if (existing?.status === 'completed' && !needsManifestRefresh) return existing;
  if (existing && ['preparing', 'queued', 'downloading'].includes(existing.status)) return existing;

  const record: OfflineCourseManifest = existing ?? {
    courseId,
    title: course.title ?? 'Curso',
    updatedAt: nowIso(),
    status: 'preparing',
    manifestVersion: 0,
    items: [],
    mediaUrls: [],
    completedFiles: 0,
    availableFiles: 0,
    totalFiles: 0,
    bytesWritten: 0,
    totalBytes: 0,
    progress: 0,
    localCompletedLessonIds: [],
    contentSummary: { videos: 0, audios: 0, pdfs: 0, activities: 0 },
  };
  if (!record.course) record.course = course;
  record.status = !needsManifestRefresh && record.course && record.items.length > 0 ? 'queued' : 'preparing';
  record.error = undefined;
  publish(record, true);

  if (needsManifestRefresh || !record.course || record.items.length === 0) {
    const prepared = await prepareCourse(record, course);
    if (!prepared) return record;
  }

  if (record.items.length === 0) {
    record.status = 'completed';
    record.downloadedAt = nowIso();
    record.progress = 1;
    publish(record, true);
    return record;
  }

  record.status = 'queued';
  publish(record, true);
  void runCourseDownload(courseId);
  return record;
}

export async function pauseCourseDownload(courseId: string) {
  const record = (await readRecords())[courseId];
  if (!record || !['downloading', 'queued', 'waiting', 'error'].includes(record.status)) return;

  record.status = 'paused';
  record.error = undefined;
  const task = activeTasks.get(courseId);
  if (task) {
    try {
      const paused = await task.pauseAsync();
      const item = record.items.find((candidate) => candidate.status === 'downloading');
      if (item) {
        item.resumeData = paused.resumeData;
        item.status = 'pending';
      }
    } catch {}
  }
  publish(record, true);
}

export async function resumeCourseDownload(courseId: string) {
  const record = (await readRecords())[courseId];
  if (!record || record.status === 'completed') return;
  record.status = networkAvailable ? 'queued' : 'waiting';
  record.error = networkAvailable ? undefined : 'Aguardando ligacao a internet';
  publish(record, true);
  if (!networkAvailable) return;
  if (!record.items.length) {
    const prepared = await prepareCourse(record, record.course);
    if (!prepared) return;
    if (!record.items.length) {
      record.status = 'completed';
      record.downloadedAt = nowIso();
      record.progress = 1;
      publish(record, true);
      return;
    }
  }
  void runCourseDownload(courseId);
}

export async function removeOfflineCourse(courseId: string) {
  const records = await readRecords();
  const record = records[courseId];
  if (!record) return;

  const task = activeTasks.get(courseId);
  if (task) await task.cancelAsync().catch(() => {});
  activeTasks.delete(courseId);
  runningCourses.delete(courseId);
  await removeOfflineMedia(record.mediaUrls);
  delete records[courseId];
  schedulePersist(true);
  emit();
}
