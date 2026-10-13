import { useEffect, useState } from 'react';

import { getNewChapters } from '~/services/newChapterService';
import { useUser } from '~/providers/UserContext';

/**
 * useNewChapters — Component -> Hook -> Service -> REAL API (/mangas/follows)
 * Compares `lastReadChapter` vs `latestChapter` on every followed comic.
 * This is the engine behind "New chapter" rails on Home and in Library.
 */
export default function useNewChapters({ limit = 8, enabled = true } = {}) {
  const { userId } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !userId) {
      setItems([]);
      return () => {};
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getNewChapters(userId, { limit })
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được danh sách chương mới');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, limit, enabled]);

  return { items, loading, error, count: items.length, hasNew: items.length > 0 };
}

export { useNewChapters };
