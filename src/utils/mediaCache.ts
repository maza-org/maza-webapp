import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import { API_BASE } from '../services/api';

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}maza-media/`;
export const OFFLINE_MEDIA_DIR = `${FileSystem.documentDirectory ?? ''}maza-offline-media/`;
const OFFLINE_REGISTRY_KEY = 'maza_offline_media_registry';

async function getOfflineRegistry(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await AsyncStorage.getItem(OFFLINE_REGISTRY_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function extensionForUrl(url: string) {
  const clean = url.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? `.${match[1].toLowerCase()}` : '';
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:|file:|data:|blob:)/i.test(url)) return url;

  const backendOrigin = API_BASE.replace(/\/api\/?$/, '');
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function offlinePathForUrl(url: string) {
  const resolvedUrl = resolveMediaUrl(url) ?? url;
  return `${OFFLINE_MEDIA_DIR}${stableHash(resolvedUrl)}${extensionForUrl(resolvedUrl)}`;
}

function cachePathForUrl(url: string) {
  const resolvedUrl = resolveMediaUrl(url) ?? url;
  return `${CACHE_DIR}${stableHash(resolvedUrl)}${extensionForUrl(resolvedUrl)}`;
}

export async function ensureOfflineMediaDirectory() {
  if (!FileSystem.documentDirectory) return false;
  await FileSystem.makeDirectoryAsync(OFFLINE_MEDIA_DIR, { intermediates: true }).catch(() => {});
  return true;
}

export async function registerOfflineMedia(url: string, fileUri: string) {
  const resolvedUrl = resolveMediaUrl(url) ?? url;
  const registry = await getOfflineRegistry();
  registry[url] = fileUri;
  registry[resolvedUrl] = fileUri;
  await AsyncStorage.setItem(OFFLINE_REGISTRY_KEY, JSON.stringify(registry));
}

export async function unregisterOfflineMedia(urls: string[]) {
  const registry = await getOfflineRegistry();
  for (const url of urls) {
    const resolvedUrl = resolveMediaUrl(url) ?? url;
    delete registry[url];
    delete registry[resolvedUrl];
  }
  await AsyncStorage.setItem(OFFLINE_REGISTRY_KEY, JSON.stringify(registry));
}

export async function getCachedMediaUri(url: string): Promise<string | null> {
  try {
    const resolvedUrl = resolveMediaUrl(url) ?? url;
    const registry = await getOfflineRegistry();
    const offlineUri = registry[url] ?? registry[resolvedUrl];
    if (offlineUri) {
      const offlineInfo = await FileSystem.getInfoAsync(offlineUri);
      if (offlineInfo.exists) return offlineUri;
    }

    const fileUri = cachePathForUrl(resolvedUrl);
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists ? fileUri : null;
  } catch {
    return null;
  }
}

export async function removeOfflineMedia(urls: string[]) {
  const registry = await getOfflineRegistry();
  const fileUris = new Set<string>();

  for (const url of urls) {
    const resolvedUrl = resolveMediaUrl(url) ?? url;
    const uri = registry[url] ?? registry[resolvedUrl] ?? offlinePathForUrl(resolvedUrl);
    if (uri) fileUris.add(uri);
    delete registry[url];
    delete registry[resolvedUrl];
  }

  await Promise.all([...fileUris].map((uri) => (
    FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})
  )));
  await AsyncStorage.setItem(OFFLINE_REGISTRY_KEY, JSON.stringify(registry));
}

export async function cacheMediaInBackground(url: string): Promise<string | null> {
  try {
    if (!FileSystem.cacheDirectory) return null;
    const resolvedUrl = resolveMediaUrl(url);
    if (!resolvedUrl || resolvedUrl.startsWith('file:')) return resolvedUrl;

    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true }).catch(() => {});
    const fileUri = cachePathForUrl(resolvedUrl);
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) return fileUri;

    const result = await FileSystem.downloadAsync(resolvedUrl, fileUri);
    return result.uri;
  } catch {
    return null;
  }
}
