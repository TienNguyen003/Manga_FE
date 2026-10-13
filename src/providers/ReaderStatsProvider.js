import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { getDashboard, getReadingCalendar, getReadingStreak } from '~/services/readingAnalyticsService';
import { getLocalStats, getTopGenres, computeBestStreak } from '~/services/readingProgressService';
import { getDailyGoalProgress, getWeeklyGoalProgress } from '~/services/readingGoalService';
import { getXpState, awardXp, XP_REWARDS } from '~/services/xpService';
import { getAchievementSummary } from '~/services/achievementService';
import { getDailyChallenges, claimChallenge } from '~/services/challengeService';
import { getMembership as readMembership, isDemoMode } from '~/services/membershipService';
import { getWallet } from '~/services/coinService';
import { subscribeStorage, STORAGE_KEYS } from '~/lib/storage';
import { toDayKey } from '~/lib/date';
import { useUser } from '~/providers/UserContext';

export const ReaderStatsContext = createContext(null);

const safeCall = async (promise, fallback) => {
  try {
    // Rule 1: one `data` hop, then `result`.
    const { data } = await promise;
    return data?.result ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * ReaderStatsProvider — the single place retention state is assembled.
 *
 * DATA SOURCE POLICY
 *   streak  : REAL API `GET /mangas/reading-analytics/streak` + calendar,
 *             automatically falling back to local reading history when the
 *             endpoint is unavailable (so the feature never shows a dead card).
 *   goal    : LOCAL (the unit is ours — see readingGoalService for the note)
 *   xp      : LOCAL
 *   badges  : derived from local stats + real dashboard counters
 *   plan    : MOCK
 *   coins   : MOCK
 *
 * It re-renders subscribers when any local store changes (storage pub/sub), so
 * the Reader writing progress instantly updates the Header chip and the Home
 * continue-reading rail.
 */
export function ReaderStatsProvider({ children }) {
  const { userId } = useUser();

  const [loading, setLoading] = useState(false);
  const [remoteStats, setRemoteStats] = useState({});
  const [serverStreak, setServerStreak] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [tick, setTick] = useState(0);

  /* --- keep in sync with localStorage writes from the Reader --- */
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const unsubs = [
      subscribeStorage(STORAGE_KEYS.READING_PROGRESS, bump),
      subscribeStorage(STORAGE_KEYS.XP, bump),
      subscribeStorage(STORAGE_KEYS.CHALLENGES, bump),
      subscribeStorage(STORAGE_KEYS.READING_GOAL, bump),
      subscribeStorage(STORAGE_KEYS.MEMBERSHIP, bump),
      subscribeStorage(STORAGE_KEYS.COINS, bump),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  /* --- REAL API: streak, calendar, and the counters achievements need --- */
  const loadRemote = useCallback(async () => {
    if (!userId) {
      setRemoteStats({});
      setServerStreak(null);
      setCalendar([]);
      return;
    }
    setLoading(true);
    const [streak, cal, dash] = await Promise.all([
      safeCall(getReadingStreak({ userId }), null),
      safeCall(getReadingCalendar({ userId, days: 7 }), []),
      safeCall(getDashboard({ userId }), {}),
    ]);
    setServerStreak(streak);
    setCalendar(Array.isArray(cal) ? cal : []);
    setRemoteStats(dash && typeof dash === 'object' ? dash : {});
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadRemote();
  }, [loadRemote]);

  /* --- Derived, recomputed on every local write (cheap: pure in-memory) --- */
  const derived = useMemo(() => {
    const local = getLocalStats();
    const streakFromApi = Number(serverStreak?.currentStreak ?? serverStreak?.streak ?? 0) || 0;

    // Prefer the server number when it is at least as good as local.
    const membership = readMembership();
    return {
      // `revision` exists so the memo legitimately re-runs whenever the storage
      // pub/sub signals a write. It is the mechanism, not incidental state.
      revision: tick,
      userId,
      loading,
      refresh: loadRemote,
      // retention
      streak: {
        current: Math.max(streakFromApi, local.localStreak || 0),
        source: streakFromApi > 0 ? 'api' : 'local',
        best: Math.max(computeBestStreak(local.activeDays), streakFromApi),
      },
      goal: getDailyGoalProgress(),
      week: getWeeklyGoalProgress(7),
      local,
      genres: getTopGenres(6),
      calendar,
      // engagement
      xp: getXpState(),
      achievements: getAchievementSummary(remoteStats),
      challenges: getDailyChallenges(toDayKey()),
      // monetization
      membership,
      isPremium: membership.isPremium,
      isDemoMode,
      wallet: getWallet(),
    };
  }, [userId, loading, serverStreak, calendar, remoteStats, loadRemote, tick]);

  /* --- Celebration: goal / level-up / challenge feedback --- */
  const celebrate = useCallback(() => {
    const result = awardXp(XP_REWARDS.DAILY_GOAL, `goal:${toDayKey()}`);
    if (result.gained) toast.success(`🎯 Hoàn thành mục tiêu hôm nay! +${result.gained} XP`);
    if (result.leveledUp) toast.success(`🎉 Lên cấp ${result.newLevel}!`, { autoClose: 4000 });
  }, []);

  const claimChallengeReward = useCallback(async (challenge) => {
    if (!challenge?.completed || challenge.rewardClaimed) return;
    claimChallenge(toDayKey(), challenge.id);
    const result = awardXp(challenge.xp, `challenge:${toDayKey()}:${challenge.id}`);
    if (result.gained) toast.success(`🏅 ${challenge.label} — +${result.gained} XP`);
    if (result.leveledUp) toast.success(`🎉 Lên cấp ${result.newLevel}!`);
  }, []);

  const value = useMemo(
    () => ({ ...derived, celebrate, claimChallengeReward }),
    [derived, celebrate, claimChallengeReward],
  );

  return <ReaderStatsContext.Provider value={value}>{children}</ReaderStatsContext.Provider>;
}

export const useReaderStats = () => {
  const ctx = useContext(ReaderStatsContext);
  if (!ctx) {
    throw new Error('useReaderStats must be used inside <ReaderStatsProvider>');
  }
  return ctx;
};
