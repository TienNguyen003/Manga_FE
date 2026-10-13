/**
 * READING PROGRESS - data source: LOCAL (localStorage)
 *
 * The backend HAS `GET /mangas/history/continue` (real API) and it already
 * powers the Library tab. But it only stores *which chapter* was opened.
 * It has NO notion of "page 37 of 52", so page-level resume is impossible
 * server-side today.
 *
 * This service owns that missing piece, keyed per comic so the UI can render
 * "Chapter 120 - Page 37/52 - 71% - 2 hours ago" and deep-link straight back
 * into the reader at the saved page.
 *
 * DATA SOURCE SWAP (future)
 * -------------------------
 * Replace the two storage calls at the bottom of this file with:
 *     await httpRequest.get('/mangas/reading-progress')
 *     await httpRequest.put('/mangas/reading-progress', entry)
 * Nothing above this layer has to change. See `useReadingProgress`.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';
import { isNightHour, isWeekend, recentDayKeys, toDayKey } from '~/lib/date';

const EMPTY = { version: 1, entries: {} };
const MAX_TRACKED_COMICS = 60; // keep localStorage small, drop the coldest

const load = () => {
  const raw = readJson(STORAGE_KEYS.READING_PROGRESS, EMPTY);
  if (!raw || typeof raw !== 'object' || !raw.entries) return { ...EMPTY };
  return raw;
};

const persist = (state) => setJson(STORAGE_KEYS.READING_PROGRESS, state);

const emptyEntry = (mangaPath) => ({
  mangaPath,
  mangaName: '',
  thumbnailUrl: '',
  genres: [],
  lastReadAt: null,
  lastChapterName: null,
  lastChapterApiData: null,
  lastChapterTitle: null,
  totalChaptersRead: 0,
  totalPagesRead: 0,
  totalMinutes: 0,
  completedChapters: 0,
  completedComics: 0,
  chapters: {},
});

export const getAllProgress = () => Object.values(load().entries);

export const getMangaProgress = (mangaPath) => load().entries[mangaPath] || null;

export const getChapterProgress = (mangaPath, chapterName) => {
  const entry = getMangaProgress(mangaPath);
  return entry?.chapters?.[chapterName] || null;
};
/**
 * Upsert progress for one chapter of one comic.
 * Called by the Reader on page change (throttled) and on chapter change.
 */
export function saveChapterProgress({
  mangaPath,
  mangaName,
  thumbnailUrl,
  genres = [],
  chapterName,
  chapterApiData = null,
  chapterTitle = null,
  currentPage = 1,
  totalPages = 0,
  minutesRead = 0,
}) {
  if (!mangaPath || !chapterName) return null;

  const state = load();
  const previous = state.entries[mangaPath] || emptyEntry(mangaPath);
  const prevChapter = previous.chapters[chapterName];

  const total = Math.max(0, Number(totalPages) || 0);
  const page = Math.max(1, Number(currentPage) || 1);
  const percent = total > 0 ? Math.min(100, Math.round((page / total) * 100)) : 0;
  // A chapter counts as finished once the reader reaches the final page.
  const completed = total > 0 ? page >= total : Boolean(prevChapter?.completed);
  const isNewChapter = !prevChapter;
  const now = new Date().toISOString();

  const entry = {
    ...previous,
    mangaPath,
    mangaName: mangaName || previous.mangaName,
    thumbnailUrl: thumbnailUrl || previous.thumbnailUrl,
    genres: Array.isArray(genres) && genres.length ? genres : previous.genres,
    lastReadAt: now,
    lastChapterName: chapterName,
    lastChapterApiData: chapterApiData || previous.lastChapterApiData,
    lastChapterTitle: chapterTitle || previous.lastChapterTitle,
    totalChaptersRead: previous.totalChaptersRead + (isNewChapter ? 1 : 0),
    totalPagesRead: previous.totalPagesRead + (isNewChapter ? Math.min(page, total || page) : 0),
    totalMinutes: previous.totalMinutes + (Number(minutesRead) || 0),
    chapters: {
      ...previous.chapters,
      [chapterName]: {
        chapterName,
        chapterApiData: chapterApiData || prevChapter?.chapterApiData || null,
        chapterTitle: chapterTitle || prevChapter?.chapterTitle || null,
        currentPage: page,
        totalPages: total || prevChapter?.totalPages || 0,
        percent,
        completed: completed || Boolean(prevChapter?.completed),
        lastReadAt: now,
        night: isNightHour(),
        weekend: isWeekend(),
      },
    },
  };

  state.entries[mangaPath] = entry;
  pruneColdEntries(state);
  persist(state);
  return entry;
}

export function markChapterCompleted({ mangaPath, chapterName }) {
  const state = load();
  const entry = state.entries[mangaPath];
  const chapter = entry?.chapters?.[chapterName];
  if (!entry || !chapter || chapter.completed) return null;

  const updated = {
    ...state,
    entries: {
      ...state.entries,
      [mangaPath]: {
        ...entry,
        completedChapters: (entry.completedChapters || 0) + 1,
        chapters: {
          ...entry.chapters,
          [chapterName]: {
            ...chapter,
            completed: true,
            percent: 100,
            currentPage: chapter.totalPages || chapter.currentPage,
          },
        },
      },
    },
  };
  persist(updated);
  return updated.entries[mangaPath];
}

/** Marks a whole comic as finished (used by achievements / profile stats). */
export function markComicCompleted({ mangaPath, mangaName, thumbnailUrl, genres }) {
  const state = load();
  const entry = state.entries[mangaPath] || emptyEntry(mangaPath);
  if (entry.completedComics > 0) return entry;
  const next = { ...entry, mangaPath, mangaName, thumbnailUrl, genres, completedComics: 1 };
  persist({ ...state, entries: { ...state.entries, [mangaPath]: next } });
  return next;
}

export function clearMangaProgress(mangaPath) {
  const state = load();
  if (!state.entries[mangaPath]) return;
  const entries = { ...state.entries };
  delete entries[mangaPath];
  persist({ ...state, entries });
}
/** Local "Continue reading" list, newest first. Merged with the real API in the hook. */
export function getLocalContinueReading(limit = 12) {
  return getAllProgress()
    .filter((entry) => entry.lastChapterName)
    .sort((a, b) => new Date(b.lastReadAt || 0) - new Date(a.lastReadAt || 0))
    .slice(0, limit)
    .map((entry) => {
      const chapter = entry.chapters[entry.lastChapterName];
      return {
        mangaPath: entry.mangaPath,
        mangaName: entry.mangaName,
        thumbnailUrl: entry.thumbnailUrl,
        chapterName: entry.lastChapterName,
        chapterApiData: entry.lastChapterApiData || chapter?.chapterApiData || null,
        currentPage: chapter?.currentPage || 1,
        totalPages: chapter?.totalPages || 0,
        percent: chapter?.percent || 0,
        completed: Boolean(chapter?.completed),
        readAt: entry.lastReadAt,
        source: 'local',
      };
    });
}

/* ------------------------------------------------------------------ *
 * Derived local stats - power streak fallback, daily goal, achievements
 * ------------------------------------------------------------------ */

export function getLocalStats() {
  const entries = Object.values(load().entries);
  const activeDays = {};
  let totalChaptersRead = 0;
  let totalPagesRead = 0;
  let totalMinutes = 0;
  let completedChapters = 0;
  let completedComics = 0;
  let nightChapters = 0;
  let weekendChapters = 0;
  const genres = {};

  entries.forEach((entry) => {
    totalChaptersRead += entry.totalChaptersRead || 0;
    totalPagesRead += entry.totalPagesRead || 0;
    totalMinutes += entry.totalMinutes || 0;
    completedChapters += entry.completedChapters || 0;
    completedComics += entry.completedComics || 0;
    (entry.genres || []).forEach((g) => {
      const name = typeof g === 'string' ? g : g?.name;
      if (name) genres[name] = (genres[name] || 0) + 1;
    });

    Object.values(entry.chapters || {}).forEach((chapter) => {
      if (chapter.night) nightChapters += 1;
      if (chapter.weekend) weekendChapters += 1;
      const dayKey = toDayKey(chapter.lastReadAt);
      if (!dayKey) return;
      const bucket = activeDays[dayKey] || { chapters: 0, pages: 0, minutes: 0 };
      bucket.chapters += 1;
      bucket.pages += chapter.totalPages || 0;
      activeDays[dayKey] = bucket;
    });
  });

  return {
    totalChaptersRead,
    totalPagesRead,
    totalMinutes,
    completedChapters,
    completedComics,
    nightChapters,
    weekendChapters,
    trackedComics: entries.length,
    activeDays,
    genres,
    localStreak: computeLocalStreak(activeDays),
    today: activeDays[toDayKey()] || { chapters: 0, pages: 0, minutes: 0 },
  };
}

/** Consecutive days ending today (or yesterday, if today is still empty). */
export function computeLocalStreak(activeDays = {}) {
  const dayKeys = recentDayKeys(60);
  let streak = 0;
  for (let i = dayKeys.length - 1; i >= 0; i -= 1) {
    if (activeDays[dayKeys[i]]) {
      streak += 1;
    } else if (i === dayKeys.length - 1) {
      continue; // today not read yet - the streak can still be alive
    } else {
      break;
    }
  }
  return streak;
}

/** Best run length across the last `windowDays` days. */
export function computeBestStreak(activeDays = {}, windowDays = 60) {
  const dayKeys = recentDayKeys(windowDays);
  let best = 0;
  let run = 0;
  dayKeys.forEach((key) => {
    if (activeDays[key]) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  });
  return best;
}

/** Most-read genre list - feeds "Your favourite genres" on Home. */
export function getTopGenres(limit = 6) {
  const { genres } = getLocalStats();
  return Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function pruneColdEntries(state) {
  const keys = Object.keys(state.entries);
  if (keys.length <= MAX_TRACKED_COMICS) return;
  keys
    .sort((a, b) => new Date(state.entries[b].lastReadAt || 0) - new Date(state.entries[a].lastReadAt || 0))
    .slice(MAX_TRACKED_COMICS)
    .forEach((key) => delete state.entries[key]);
}

const readingProgressService = {
  getAllProgress,
  getMangaProgress,
  getChapterProgress,
  saveChapterProgress,
  markChapterCompleted,
  markComicCompleted,
  clearMangaProgress,
  getLocalContinueReading,
  getLocalStats,
  getTopGenres,
  computeLocalStreak,
  computeBestStreak,
};

export default readingProgressService;
