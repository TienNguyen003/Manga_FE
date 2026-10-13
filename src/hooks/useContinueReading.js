import { useEffect, useMemo, useState } from 'react';

import { unwrapList } from '~/lib/httpRequest';
import { getContinueReading } from '~/services/historyService';
import { getLocalContinueReading } from '~/services/readingProgressService';
import { mergeContinueReading } from '~/services/newChapterService';
import { subscribeStorage, STORAGE_KEYS } from '~/lib/storage';
import { useUser } from '~/providers/UserContext';

/**
 * useContinueReading — Component -> Hook -> Service -> REAL API + LOCAL
 *
 * The real API (`/mangas/history/continue`) answers "which comic"; local
 * progress answers "which page". `mergeContinueReading` joins them so a card
 * can link straight back into the reader at the saved page.
 *
 * A failed API must not blank the rail, so the local list is always the floor.
 */
export default function useContinueReading({ limit = 10 } = {}) {
  const { userId } = useUser();
  const [apiItems, setApiItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const bump = () => setVersion((v) => v + 1);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setApiItems([]);
      setLoading(false);
      return () => {};
    }
    setLoading(true);
    setError(null);
    getContinueReading({ userId, limit })
      .then(({ data }) => {
        if (!cancelled) setApiItems(unwrapList({ data }));
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được danh sách tiếp tục đọc');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, limit]);

  // Re-merge when the Reader writes progress, so the rail reflects it live.
  useEffect(() => subscribeStorage(STORAGE_KEYS.READING_PROGRESS, bump), []);

  const items = useMemo(
    () => mergeContinueReading({ apiItems, localItems: getLocalContinueReading(limit) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiItems, limit, version],
  );

  return { items, loading, error, hasItems: items.length > 0 };
}

export { useContinueReading };
