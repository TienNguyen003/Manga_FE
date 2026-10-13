import { useCallback, useEffect, useMemo, useState } from 'react';

import readingProgressService from '~/services/readingProgressService';
import { subscribeStorage, STORAGE_KEYS } from '~/lib/storage';

/**
 * useReadingProgress — Page/Component -> Hook -> Service -> localStorage
 *
 * Subscribe/re-sync happens through the storage pub/sub, so the Reader
 * writing progress instantly refreshes every consumer (Home, Library, Header)
 * without any manual invalidation.
 */
export default function useReadingProgress(mangaPath, chapterName) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    const unsub = subscribeStorage(STORAGE_KEYS.READING_PROGRESS, bump);
    return unsub;
  }, []);

  const manga = useMemo(
    () => (mangaPath ? readingProgressService.getMangaProgress(mangaPath) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mangaPath, version],
  );

  const chapter = useMemo(
    () => (mangaPath && chapterName ? readingProgressService.getChapterProgress(mangaPath, chapterName) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mangaPath, chapterName, version],
  );

  const save = useCallback((payload) => readingProgressService.saveChapterProgress(payload), []);
  const clear = useCallback(() => mangaPath && readingProgressService.clearMangaProgress(mangaPath), [mangaPath]);
  const markCompleted = useCallback(
    () => mangaPath && chapterName && readingProgressService.markChapterCompleted({ mangaPath, chapterName }),
    [mangaPath, chapterName],
  );

  return {
    mangaProgress: manga,
    chapterProgress: chapter,
    percent: chapter?.percent || 0,
    currentPage: chapter?.currentPage || 0,
    totalPages: chapter?.totalPages || 0,
    isCompleted: Boolean(chapter?.completed),
    lastReadAt: chapter?.lastReadAt || manga?.lastReadAt || null,
    save,
    clear,
    markCompleted,
  };
}

export { useReadingProgress };
