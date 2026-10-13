import { useCallback } from 'react';

import { useReaderStats } from '~/providers/ReaderStatsProvider';
import { setDailyGoal } from '~/services/readingGoalService';
import { subscribeStorage, STORAGE_KEYS } from '~/lib/storage';
import { useEffect, useState } from 'react';

/**
 * useReadingGoal — Component -> Hook -> Service -> localStorage
 * Owns the daily goal widget: current progress, the 7-day strip and the
 * preset picker. Re-reads storage on the pub/sub so a goal set in Settings is
 * reflected on Home immediately.
 */
export default function useReadingGoal() {
  const { goal, week, celebrate, local } = useReaderStats();
  const [, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    return subscribeStorage(STORAGE_KEYS.READING_GOAL, bump);
  }, []);

  const updateGoal = useCallback(
    (next) => {
      const saved = setDailyGoal(next);
      celebrate();
      return saved;
    },
    [celebrate],
  );

  return {
    goal,
    week,
    local,
    updateGoal,
    isComplete: goal.completed,
  };
}

export { useReadingGoal };
