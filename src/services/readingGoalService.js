/**
 * DAILY READING GOAL — data source: LOCAL (localStorage)
 *
 * IMPORTANT / HONEST NOTE
 * -----------------------
 * The backend DOES expose reading goals:
 *     PUT  /mangas/reading-analytics/goal
 *     GET  /mangas/reading-analytics/goal
 *     GET  /mangas/reading-analytics/goal/progress
 * The existing UserDashboard calls them, but the unit is a bare `goal` number
 * and the existing UI labels it "chapters". We do NOT know the backend unit, so
 * we do NOT silently write page/minute targets into that field.
 *
 * Therefore: the page/minute goal is tracked locally (we control the unit and
 * the page counts), and the server goal is read-only and surfaced separately.
 * When the backend confirms its unit, `syncGoalToServer()` becomes the bridge.
 *
 * DATA SOURCE SWAP (future)
 * -------------------------
 * Add `goalType` to the server payload, then call `syncGoalToServer()` after
 * every local change. No UI change required.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';
import { recentDayKeys, toDayKey } from '~/lib/date';
import { getLocalStats } from '~/services/readingProgressService';
import { updateReadingGoal } from '~/services/readingAnalyticsService';

export const GOAL_TYPES = [
  { value: 'pages', label: 'Trang', unit: 'trang', presets: [10, 20, 30, 60] },
  { value: 'chapters', label: 'Chương', unit: 'chương', presets: [1, 3, 5, 10] },
  { value: 'minutes', label: 'Phút', unit: 'phút', presets: [10, 20, 30, 60] },
];

const DEFAULT_GOAL = { type: 'pages', target: 30, updatedAt: null };

export function getDailyGoal() {
  return { ...DEFAULT_GOAL, ...(readJson(STORAGE_KEYS.READING_GOAL, {}) || {}) };
}

export function setDailyGoal({ type, target }) {
  const current = getDailyGoal();
  const next = {
    type: type || current.type,
    target: Math.max(1, Number(target) || 1),
    updatedAt: new Date().toISOString(),
  };
  setJson(STORAGE_KEYS.READING_GOAL, next);
  return next;
}

/** Today's progress measured in the SAME unit as the goal. */
export function getTodayProgress(type = getDailyGoal().type) {
  const stats = getLocalStats();
  const today = stats.today || { chapters: 0, pages: 0, minutes: 0 };
  const value = type === 'chapters' ? today.chapters : type === 'minutes' ? today.minutes : today.pages;
  return Math.max(0, Math.round(value || 0));
}

export function getDailyGoalProgress() {
  const goal = getDailyGoal();
  const current = getTodayProgress(goal.type);
  const target = Math.max(1, goal.target || 1);
  return {
    ...goal,
    current,
    target,
    remaining: Math.max(0, target - current),
    percent: Math.min(100, Math.round((current / target) * 100)),
    completed: current >= target,
    unit: GOAL_TYPES.find((t) => t.value === goal.type)?.unit || 'trang',
  };
}

/** Last 7 days in the goal's unit — powers the weekly goal strip. */
export function getWeeklyGoalProgress(days = 7) {
  const goal = getDailyGoal();
  const stats = getLocalStats();
  return recentDayKeys(days).map((dayKey) => {
    const bucket = stats.activeDays?.[dayKey] || { chapters: 0, pages: 0, minutes: 0 };
    const value = goal.type === 'chapters' ? bucket.chapters : goal.type === 'minutes' ? bucket.minutes : bucket.pages;
    return { dayKey, value: Math.max(0, Math.round(value || 0)), met: value >= goal.target };
  });
}

export const isTodayComplete = () => getDailyGoalProgress().completed;

/**
 * Bridge for when the backend confirms its goal unit.
 * Currently unused by the UI on purpose — see the honest note at the top.
 */
export async function syncGoalToServer(userId) {
  const goal = getDailyGoal();
  if (!userId) return null;
  // Rule 3: no `userId` in this write body — the JWT identifies the caller.
  return updateReadingGoal({ targetChapters: goal.target, targetMinutes: 0, period: 'DAILY' });
}

const readingGoalService = {
  getDailyGoal,
  setDailyGoal,
  getTodayProgress,
  getDailyGoalProgress,
  getWeeklyGoalProgress,
  isTodayComplete,
  syncGoalToServer,
  GOAL_TYPES,
  todayKey: () => toDayKey(),
};

export default readingGoalService;
