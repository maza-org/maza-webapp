import { Platform } from 'react-native';

const ANDROID_NAV_GUARD = 72;

export function bottomSafeSpace(bottomInset: number, extra = 0) {
  const minimumBottom = Platform.OS === 'android' ? ANDROID_NAV_GUARD : 0;
  return Math.max(bottomInset + extra, minimumBottom + extra);
}
