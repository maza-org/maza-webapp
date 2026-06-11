import React, { memo, useEffect, useMemo, useState } from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import CourseBokehBg from './CourseBokehBg';
import { API_BASE as _API_BASE } from '../services/api';
import { cacheMediaInBackground, getCachedMediaUri } from '../utils/mediaCache';

const API_BASE = _API_BASE.replace('/api', '');

interface Props {
  courseId: string;
  title?: string;
  thumbnail: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  imgStyle?: object;
}

/**
 * Shows the course thumbnail from the backend, falling back to the
 * deterministic CourseBokehBg gradient when no image is set or loading fails.
 * Handles both relative (/uploads/…) and absolute (http://…) URLs.
 */
function CourseThumbnailImage({ courseId, title, thumbnail, style, imgStyle }: Props) {
  const [error, setError] = useState(false);
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  const uri = useMemo(
    () =>
      thumbnail
        ? thumbnail.startsWith('http')
          ? thumbnail
          : `${API_BASE}${thumbnail}`
        : null,
    [thumbnail]
  );

  useEffect(() => {
    let mounted = true;
    setError(false);
    setCachedUri(null);

    if (!uri) return;

    (async () => {
      const local = await getCachedMediaUri(uri);
      if (mounted && local) setCachedUri(local);

      Image.prefetch(uri).catch(() => {});
      const downloaded = await cacheMediaInBackground(uri);
      if (mounted && downloaded) setCachedUri(downloaded);
    })();

    return () => {
      mounted = false;
    };
  }, [uri]);

  const resolvedUri = cachedUri ?? uri;
  const showGradient = !resolvedUri || error;

  if (showGradient) {
    return (
      <CourseBokehBg
        courseId={courseId}
        title={title}
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, style]}
      />
    );
  }

  return (
    <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }, style]}>
      <Image
        source={{ uri: resolvedUri, cache: 'force-cache' } as any}
        style={[{ width: '100%', height: '100%', borderRadius: 12 }, imgStyle]}
        resizeMode="cover"
        onError={() => setError(true)}
      />
    </View>
  );
}

export default memo(CourseThumbnailImage);
