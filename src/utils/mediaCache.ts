import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}maza-media/`;

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
    const fileUri = cachePathForUrl(url);
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists ? fileUri : null;
  } catch {
    return null;
  }
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
