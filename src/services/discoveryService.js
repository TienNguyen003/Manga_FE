/**
 * "WHAT SHOULD I READ NEXT?" - data source: REAL APIs
 *
 * Goal: cut the time from landing on the site to opening chapter 1.
 * The reader picks a few signals, we turn them into calls the backend already
 * supports, then rank/filter the real result set.
 *
 * Endpoints used (all real, all already used elsewhere in this app):
 *   GET /recommendations/mangas?userId&limit
 *   GET /mangas/category?path=&page=
 *   GET /mangas/search?keyword=&page=
 *
 * Deliberately NOT used: `GET /mangas/list` - its query contract is unknown
 * (it is currently unreferenced in the codebase), so we will not guess params.
 *
 * The selected signals themselves are persisted locally so the finder can
 * pre-fill next time.
 */
import { unwrapList } from '~/lib/httpRequest';
import { getMangasByCategory, getCategories, searchMangas } from '~/services/mangaService';
import { getRecommendationsMangas } from '~/services/recommendationService';
import { getHistory } from '~/services/historyService';
import { getAllProgress } from '~/services/readingProgressService';
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';

export const MOODS = [
  { id: 'light', label: 'Nhẹ nhàng, cười được', emoji: '🍃', keywords: ['romance', 'comedy'] },
  { id: 'epic', label: 'Hào hùng, phiêu lưu', emoji: '⚔️', keywords: ['action', 'adventure', 'fantasy'] },
  { id: 'dark', label: 'Nặng đôi, hồi tưởng', emoji: '🖤', keywords: ['drama', 'thriller'] },
  { id: 'sweet', label: 'Ngọt ngào tình cảm', emoji: '💗', keywords: ['romance'] },
  { id: 'brain', label: 'Cần thêm suy nghĩ', emoji: '🧠', keywords: ['mystery', 'sci-fi'] },
];

export const PACE_FILTERS = [
  { id: 'short', label: 'Ngắn — đọc nhanh', maxChapters: 50 },
  { id: 'medium', label: 'Vừa — vài chục chương', maxChapters: 200 },
  { id: 'long', label: 'Dài — trên 200 chương', minChapters: 200 },
];

export const STATUS_FILTERS = [
  { id: 'completed', label: 'Đã hoàn thành' },
  { id: 'ongoing', label: 'Đang cập nhật' },
];

export const DEFAULT_PREFERENCES = { moods: [], genres: [], pace: null, status: null, keyword: '' };

export const getDiscoveryPreferences = () => ({
  ...DEFAULT_PREFERENCES,
  ...(readJson(STORAGE_KEYS.DISCOVERY_PREFERENCES, {}) || {}),
});

export const saveDiscoveryPreferences = (prefs) => {
  const next = { ...getDiscoveryPreferences(), ...prefs };
  setJson(STORAGE_KEYS.DISCOVERY_PREFERENCES, next);
  return next;
};

export const resetDiscoveryPreferences = () => {
  setJson(STORAGE_KEYS.DISCOVERY_PREFERENCES, DEFAULT_PREFERENCES);
  return { ...DEFAULT_PREFERENCES };
};

const chapterCountOf = (manga) => {
  const raw = manga?.chaptersLatest?.[0]?.chapter_name ?? manga?.totalChapters ?? manga?.chapterCount;
  const n = parseFloat(String(raw ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const normaliseStatus = (value) => {
  const s = String(value ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s.includes('complete') || s.includes('hoàn thành') || s === 'finished') return 'completed';
  if (s.includes('ongoing') || s.includes('đang') || s.includes('updating')) return 'ongoing';
  return s;
};

const moodKeywords = (moods) => MOODS.filter((m) => moods.includes(m.id)).flatMap((m) => m.keywords);

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((m) => {
    const slug = m?.mangaPath || m?.slug;
    if (!slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
};
/**
 * Runs the finder.
 * @returns {Promise<{results: Array, sources: string[], total: number}>}
 */
export async function findSomethingToRead(prefs, { userId } = {}) {
  const settings = { ...DEFAULT_PREFERENCES, ...(prefs || {}) };
  const seenSlugs = new Set(getAllProgress().map((e) => e.mangaPath));
  let historySlugs = new Set();
  const sources = [];

  if (userId) {
    try {
      const { data } = await getHistory({ userId });
      historySlugs = new Set(unwrapList({ data }).map((h) => h.mangaPath));
    } catch {
      /* history is only used to de-prioritise already-read comics */
    }
  }

  const fetches = [];
  const push = (label, promise) => {
    sources.push(label);
    // Rule 1: the fallback chain `res?.result || res?.data || []` turned any
    // failure into an empty list — read the envelope properly instead.
    fetches.push(promise.then(({ data }) => unwrapList({ data })).catch(() => []));
  };

  // `page` is 0-BASED (Rule 2) — page 1 would silently skip the first page.
  (settings.genres || []).forEach((slug) => push(`category:${slug}`, getMangasByCategory({ path: slug, page: 0 })));

  // 2. Moods imply genres when the reader did not pick explicitly.
  if (!(settings.genres || []).length && (settings.moods || []).length) {
    moodKeywords(settings.moods)
      .slice(0, 2)
      .forEach((slug) => push(`category:${slug}`, getMangasByCategory({ path: slug, page: 0 })));
  }

  // 3. Free-text keyword.
  if (settings.keyword?.trim()) {
    push('search', searchMangas({ keyword: settings.keyword.trim(), page: 0 }));
  }

  // 4. Personalised picks are always mixed in so the finder is never empty.
  push('recommendations', getRecommendationsMangas({ userId: userId || undefined, limit: 24 }));

  const settled = await Promise.all(fetches);
  const pool = dedupe(
    settled
      .flat()
      .map((m) => ({ ...m, slug: m.mangaPath || m.slug, title: m.name || m.mangaName }))
      .filter((m) => m.slug),
  );

  const pace = PACE_FILTERS.find((p) => p.id === settings.pace);
  const status = STATUS_FILTERS.find((s) => s.id === settings.status);

  const results = pool
    .filter((m) => {
      if (status && normaliseStatus(m.status) !== status.id) return false;
      if (pace) {
        const count = chapterCountOf(m);
        if (count === null) return true; // unknown length - do not hide it
        if (pace.maxChapters && count > pace.maxChapters) return false;
        if (pace.minChapters && count < pace.minChapters) return false;
      }
      return true;
    })
    .map((m) => ({
      ...m,
      thumb: m.thumbnailUrl || m.thumb_url || m.cover || '',
      chapters: chapterCountOf(m),
      statusLabel: m.status || '',
      alreadyRead: seenSlugs.has(m.slug) || historySlugs.has(m.slug),
    }))
    // Fresh blood first: anything the reader has not opened yet.
    .sort((a, b) => Number(b.alreadyRead) - Number(a.alreadyRead))
    .slice(0, 24);

  return { results, sources, total: results.length };
}

export async function getAvailableGenres() {
  try {
    const { data } = await getCategories();
    const list = unwrapList({ data });
    return list.map((c) => ({ name: c.name, slug: c.slug || String(c.name).toLowerCase().replace(/\s+/g, '-') }));
  } catch {
    return [];
  }
}

const discoveryService = {
  MOODS,
  PACE_FILTERS,
  STATUS_FILTERS,
  findSomethingToRead,
  getAvailableGenres,
  getDiscoveryPreferences,
  saveDiscoveryPreferences,
  resetDiscoveryPreferences,
};

export default discoveryService;
