/**
 * DAILY CHALLENGES — data source: LOCAL (derived + persisted progress)
 *
 * The rotation is DETERMINISTIC: the same calendar day always yields the same
 * 3 challenges (hash of the day key picks the set), so a refresh never
 * rerolls the list and the reader can trust "today's challenges".
 * Only completion state is persisted.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';
import { hashString, toDayKey } from '~/lib/date';
import { getLocalStats } from '~/services/readingProgressService';
import { getDailyGoalProgress } from '~/services/readingGoalService';

export const CHALLENGE_POOL = [
  { id: 'read-3-chapters', label: 'Đọc 3 chương', metric: 'todayChapters', target: 3, xp: 50, icon: '📖' },
  { id: 'read-1-chapter', label: 'Đọc 1 chương', metric: 'todayChapters', target: 1, xp: 20, icon: '📕' },
  { id: 'read-20-pages', label: 'Đọc 20 trang', metric: 'todayPages', target: 20, xp: 50, icon: '🧻' },
  { id: 'read-50-pages', label: 'Đọc 50 trang', metric: 'todayPages', target: 50, xp: 120, icon: '📚' },
  { id: 'hit-goal', label: 'Hoàn thành mục tiêu hôm nay', metric: 'goalPercent', target: 100, xp: 60, icon: '🎯' },
  { id: 'read-3-comics', label: 'Đọc 3 truyện khác nhau', metric: 'todayComics', target: 3, xp: 70, icon: '🗂️' },
  { id: 'revisit', label: 'Quay lại truyện đã bỏ dở', metric: 'todayReopened', target: 1, xp: 25, icon: '↩️' },
];

const DAILY_COUNT = 3;

const loadState = () => readJson(STORAGE_KEYS.CHALLENGES, {}) || {};

const getMetricValue = (metric, stats) => {
  const today = stats.today || { chapters: 0, pages: 0 };
  switch (metric) {
    case 'todayChapters':
      return today.chapters || 0;
    case 'todayPages':
      return today.pages || 0;
    case 'todayComics':
      return today.comics || 0;
    case 'goalPercent':
      return getDailyGoalProgress().percent;
    case 'todayReopened':
      return today.reopened || 0;
    default:
      return 0;
  }
};

/** Deterministic 3 challenges for a given day. */
export function getChallengesForDay(dayKey = toDayKey()) {
  if (!dayKey) return [];
  const pool = [...CHALLENGE_POOL];
  const picked = [];
  let seed = hashString(`cmx-challenge-${dayKey}`);

  while (picked.length < DAILY_COUNT && pool.length > 0) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const index = seed % pool.length;
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked.map((c) => c.id);
}

export function getDailyChallenges(dayKey = toDayKey()) {
  const ids = getChallengesForDay(dayKey);
  const stats = getLocalStats();
  const claimed = loadState()[dayKey]?.claimed || [];

  const list = ids
    .map((id) => CHALLENGE_POOL.find((c) => c.id === id))
    .filter(Boolean)
    .map((challenge) => {
      const current = Math.min(getMetricValue(challenge.metric, stats), challenge.target);
      const completed = current >= challenge.target;
      return {
        ...challenge,
        current,
        completed,
        percent: Math.min(100, Math.round((current / challenge.target) * 100)),
        progressLabel: `${current} / ${challenge.target}`,
        rewardClaimed: claimed.includes(challenge.id),
      };
    });

  return {
    dayKey,
    list,
    completedCount: list.filter((c) => c.completed).length,
    totalCount: list.length,
    claimableXp: list
      .filter((c) => c.completed && !c.rewardClaimed)
      .reduce((sum, c) => sum + c.xp, 0),
  };
}

/**
 * Marks rewards as claimed. XP itself is granted by the caller through
 * `xpService.awardXp` with a day-scoped event id, so this only records UI state.
 */
export function claimChallenge(dayKey, challengeId) {
  const state = loadState();
  const day = state[dayKey] || { claimed: [] };
  if (day.claimed.includes(challengeId)) return day.claimed;
  const claimed = [...day.claimed, challengeId];
  // Keep the ledger bounded — only today + yesterday are ever displayed.
  const keys = Object.keys(state).sort();
  const trimmed = keys.slice(-2);
  const next = { ...Object.fromEntries(trimmed.map((k) => [k, state[k]])), [dayKey]: { claimed } };
  setJson(STORAGE_KEYS.CHALLENGES, next);
  return claimed;
}

const challengeService = {
  CHALLENGE_POOL,
  getChallengesForDay,
  getDailyChallenges,
  claimChallenge,
};

export default challengeService;
