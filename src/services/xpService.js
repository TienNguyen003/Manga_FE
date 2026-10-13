/**
 * READER XP / LEVEL — data source: LOCAL (localStorage)
 *
 * Deliberately simple: a flat XP total, a level curve, and a dedupe set of
 * awarded event ids so the same action can never be farmed by remounting.
 * No leaderboards, no decay, no energy timers — this is a habit nudge, not a
 * full game system.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';

export const XP_REWARDS = {
  OPEN_CHAPTER: 10,
  COMPLETE_CHAPTER: 15,
  DAILY_GOAL: 25,
  COMPLETE_CHALLENGE: 50,
  UNLOCK_ACHIEVEMENT: 30,
  STREAK_3: 40,
  STREAK_7: 100,
  STREAK_30: 300,
  RATE_COMIC: 5,
  FOLLOW_COMIC: 3,
  COMMENT: 5,
  FINISH_COMIC: 120,
};

export const LEVEL_TITLES = [
  { min: 1, title: 'Mới bắt đầu' },
  { min: 3, title: 'Đọc giả' },
  { min: 6, title: 'Đọc giả chăm chỉ' },
  { min: 10, title: 'Thiên lý giải' },
  { min: 15, title: 'Bậc thầy truyện' },
  { min: 22, title: 'Huyền thoại' },
];

/** XP required to go from `level` to `level + 1`. */
export const xpForNextLevel = (level) => 250 + (level - 1) * 150;

/** Cumulative XP needed to REACH a level. */
export function xpRequiredForLevel(level) {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l += 1) total += xpForNextLevel(l);
  return total;
}

export const getLevelFromXp = (totalXp) => {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return { level, intoLevel: remaining, needed: xpForNextLevel(level) };
};

export const getLevelTitle = (level) =>
  [...LEVEL_TITLES].reverse().find((t) => level >= t.min)?.title || 'Mới bắt đầu';

const EMPTY = { totalXp: 0, awardedEvents: [], unlockedAchievements: [] };

const load = () => readJson(STORAGE_KEYS.XP, EMPTY) || { ...EMPTY };

/**
 * Grant XP exactly once per logical event.
 * @param {string} eventId stable id, e.g. `chapter:one-piece:120:done`
 */
export function awardXp(amount, eventId) {
  const state = load();
  const gain = Math.max(0, Number(amount) || 0);
  if (gain === 0) return { gained: 0, ...getXpState(), skipped: true };

  if (eventId && state.awardedEvents.includes(eventId)) {
    return { gained: 0, ...getXpState(), skipped: true };
  }

  const before = getLevelFromXp(state.totalXp);
  const next = {
    totalXp: state.totalXp + gain,
    awardedEvents: eventId
      ? [...state.awardedEvents, eventId].slice(-500)
      : state.awardedEvents,
    unlockedAchievements: state.unlockedAchievements || [],
  };
  setJson(STORAGE_KEYS.XP, next);

  const after = getLevelFromXp(next.totalXp);
  return {
    gained: gain,
    ...getXpState(),
    leveledUp: after.level > before.level,
    newLevel: after.level > before.level ? after.level : null,
  };
}

export function getXpState() {
  const state = load();
  const { level, intoLevel, needed } = getLevelFromXp(state.totalXp);
  return {
    totalXp: state.totalXp,
    level,
    levelTitle: getLevelTitle(level),
    intoLevel,
    needed,
    percent: Math.min(100, Math.round((intoLevel / needed) * 100)),
    unlockedAchievements: state.unlockedAchievements || [],
  };
}

export function markAchievementUnlocked(achievementId) {
  const state = load();
  if ((state.unlockedAchievements || []).includes(achievementId)) return state.unlockedAchievements;
  const next = { ...state, unlockedAchievements: [...(state.unlockedAchievements || []), achievementId] };
  setJson(STORAGE_KEYS.XP, next);
  return next.unlockedAchievements;
}

export function resetXp() {
  setJson(STORAGE_KEYS.XP, { ...EMPTY });
}

const xpService = { awardXp, getXpState, markAchievementUnlocked, resetXp, XP_REWARDS };

export default xpService;
