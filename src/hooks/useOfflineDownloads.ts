import { useEffect, useMemo, useState } from 'react';

import {
  getOfflineDownload,
  initializeOfflineDownloads,
  OfflineCourseManifest,
  subscribeOfflineDownloads,
} from '../services/offlineCourses';

export function useOfflineDownloads() {
  const [records, setRecords] = useState<Record<string, OfflineCourseManifest>>({});

  useEffect(() => {
    void initializeOfflineDownloads();
    const unsubscribe = subscribeOfflineDownloads(setRecords);
    return () => { unsubscribe(); };
  }, []);

  return records;
}

export function useOfflineDownload(courseId?: string) {
  const records = useOfflineDownloads();
  const [initialRecord, setInitialRecord] = useState<OfflineCourseManifest | null>(null);

  useEffect(() => {
    if (!courseId) return;
    void getOfflineDownload(courseId).then(setInitialRecord);
  }, [courseId]);

  return useMemo(
    () => (courseId ? records[courseId] ?? initialRecord : null),
    [courseId, initialRecord, records]
  );
}
