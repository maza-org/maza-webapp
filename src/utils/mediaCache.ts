import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}maza-media/`;
const OFFLINE_DIR = `${FileSystem.documentDirectory ?? ''}maza-offline-media/`;
const OFFLINE_REGISTRY_KEY = 'maza_offline_media_registry';

async function getOfflineRegistry(): Promise<Record<string, string>> {
  try { return JSON.parse(await AsyncStorage.getItem(OFFLINE_REGISTRY_KEY) ?? '{}'); }
  catch { return {}; }
}

function extensionForUrl(url: string) {
  const clean = url.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? `.${match[1].toLowerCase()}` : '';
}

function cachePathForUrl(url: string) {
  const safeName = encodeURIComponent(url).replace(/%/g, '').slice(-120);
  return `${CACHE_DIR}${safeName}${extensionForUrl(url)}`;
}

export async function getCachedMediaUri(url: string): Promise<string | null> {
  try {
    const offlineUri = (await getOfflineRegistry())[url];
    if (offlineUri) {
      const offlineInfo = await FileSystem.getInfoAsync(offlineUri);
      if (offlineInfo.exists) return offlineUri;
    }
    const fileUri = cachePathForUrl(url);
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists ? fileUri : null;
  } catch {
    return null;
  }
}

export async function downloadMediaForOffline(url: string): Promise<string | null> {
  try {
    if (!FileSystem.documentDirectory) return null;
    await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true }).catch(() => {});
    const safeName = encodeURIComponent(url).replace(/%/g, '').slice(-120);
    const fileUri = `${OFFLINE_DIR}${safeName}${extensionForUrl(url)}`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) await FileSystem.downloadAsync(url, fileUri);
    const registry = await getOfflineRegistry();
    registry[url] = fileUri;
    await AsyncStorage.setItem(OFFLINE_REGISTRY_KEY, JSON.stringify(registry));
    return fileUri;
  } catch {
    return null;
  }
}

export async function removeOfflineMedia(urls: string[]) {
  const registry = await getOfflineRegistry();
  await Promise.all(urls.map(async (url) => {
    const uri = registry[url];
    if (uri) await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    delete registry[url];
  }));
  await AsyncStorage.setItem(OFFLINE_REGISTRY_KEY, JSON.stringify(registry));
}

export async function cacheMediaInBackground(url: string): Promise<string | null> {
  try {
    if (!FileSystem.cacheDirectory) return null;
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true }).catch(() => {});
    const fileUri = cachePathForUrl(url);
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) return fileUri;
    const result = await FileSystem.downloadAsync(url, fileUri);
    return result.uri;
  } catch {
    return null;
  }
}
