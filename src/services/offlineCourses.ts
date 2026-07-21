import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadMediaForOffline, removeOfflineMedia } from '../utils/mediaCache';

const MANIFEST_KEY = 'maza_offline_courses';

export type OfflineCourseManifest = {
  courseId: string;
  title: string;
  downloadedAt: string;
  mediaUrls: string[];
  availableFiles: number;
  totalFiles: number;
};

async function readManifest(): Promise<Record<string, OfflineCourseManifest>> {
  try { return JSON.parse(await AsyncStorage.getItem(MANIFEST_KEY) ?? '{}'); }
  catch { return {}; }
}

function collectMediaUrls(course: any) {
  const urls = new Set<string>();
  if (course?.thumbnail) urls.add(course.thumbnail);
  for (const module of course?.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      [lesson.videoUrl, lesson.audioUrl, lesson.pdfUrl].filter(Boolean).forEach((url) => urls.add(url));
    }
  }
  return [...urls];
}

export async function getOfflineCourse(courseId: string) {
  return (await readManifest())[courseId] ?? null;
}

export async function listOfflineCourses() {
  return Object.values(await readManifest());
}

export async function downloadCourseForOffline(course: any, onProgress?: (done: number, total: number) => void) {
  const mediaUrls = collectMediaUrls(course);
  let availableFiles = 0;
  for (let index = 0; index < mediaUrls.length; index += 1) {
    const uri = await downloadMediaForOffline(mediaUrls[index]);
    if (uri) availableFiles += 1;
    onProgress?.(index + 1, mediaUrls.length);
  }
  const manifest = await readManifest();
  manifest[course.id] = {
    courseId: course.id,
    title: course.title,
    downloadedAt: new Date().toISOString(),
    mediaUrls,
    availableFiles,
    totalFiles: mediaUrls.length,
  };
  await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
  return manifest[course.id];
}

export async function removeOfflineCourse(courseId: string) {
  const manifest = await readManifest();
  const item = manifest[courseId];
  if (item) await removeOfflineMedia(item.mediaUrls);
  delete manifest[courseId];
  await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
}
