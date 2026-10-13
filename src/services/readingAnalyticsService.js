/**
 * READING ANALYTICS (gamification)
 *
 *   POST /mangas/reading-analytics/session          -> open a reading session
 *   PUT  /mangas/reading-analytics/session/close    -> close it, grants XP
 *   GET  /mangas/reading-analytics/goal             -> { targetChapters,
 *                                                       targetMinutes, period }
 *   PUT  /mangas/reading-analytics/goal
 *   GET  /mangas/reading-analytics/goal/progress
 *   GET  /mangas/reading-analytics/streak?userId=
 *   GET  /mangas/reading-analytics/calendar?userId=&days=
 *   GET  /mangas/reading-analytics/xp?userId=
 *   GET  /mangas/reading-analytics/achievements?userId=
 *   POST /mangas/reading-analytics/achievements/evaluate
 *   GET  /mangas/reading-analytics/challenges?userId=
 *
 * ⚠️ ACHIEVEMENT vs BADGE — two different systems, do not merge them:
 *   · Achievement  -> `/mangas/reading-analytics/achievements`
 *                    awarded automatically from reading metrics.
 *                    Shape: { code, name, metric, target, current,
 *                              percent, unlocked }
 *   · Badge        -> `/admin/badges/**`
 *                    granted by an admin, curated.
 *
 * Rule 3: `userId` is for reads. Writes must not send one
 * (`403 USER_ID_MISMATCH` otherwise).
 */
import { get, post, put } from '~/lib/httpRequest';

const url = '/mangas/reading-analytics';

/* --- sessions --- */
export const createReadingSession = (data) => post(`${url}/session`, data);
export const closeReadingSession = (data) => put(`${url}/session/close`, data);

/* --- goal --- */
export const getReadingGoal = ({ userId } = {}) => get(`${url}/goal`, { params: { userId } });
export const updateReadingGoal = (data) => put(`${url}/goal`, data);
export const getReadingGoalProgress = ({ userId } = {}) =>
  get(`${url}/goal/progress`, { params: { userId } });

/* --- streaks & calendar --- */
export const getReadingStreak = ({ userId } = {}) => get(`${url}/streak`, { params: { userId } });
export const getReadingCalendar = ({ userId, days = 30 } = {}) =>
  get(`${url}/calendar`, { params: { userId, days } });

/* --- xp & level --- */
export const getXp = ({ userId } = {}) => get(`${url}/xp`, { params: { userId } });

/* --- achievements (automatic, metric-driven) --- */
export const getAchievements = ({ userId } = {}) => get(`${url}/achievements`, { params: { userId } });

/** Returns `string[]` — the codes unlocked by this evaluation. */
export const evaluateAchievements = (data) => post(`${url}/achievements/evaluate`, data);

/* --- daily challenges --- */
/** Three challenges for today. */
export const getChallenges = ({ userId } = {}) => get(`${url}/challenges`, { params: { userId } });

/* --- aggregate counters --- */
export const getDashboard = ({ userId } = {}) => get('/mangas/dashboard', { params: { userId } });

/* ------------------------------------------------------------------ *
 * Shape helpers
 * ------------------------------------------------------------------ */

export async function fetchAchievements(userId) {
  const { data } = await getAchievements({ userId });
  const list = Array.isArray(data?.result) ? data.result : [];
  return list.map((a) => ({
    ...a,
    // `unlocked` may arrive as a boolean or 0/1 depending on the serialiser.
    unlocked: a.unlocked === true || Number(a.unlocked) === 1,
    percent: Number(a.percent ?? 0),
  }));
}

export async function evaluateAchievementProgress(payload) {
  const { data } = await evaluateAchievements(payload);
  return Array.isArray(data?.result) ? data.result : [];
}

