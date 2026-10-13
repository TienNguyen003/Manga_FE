/**
 * NEW CHAPTER DETECTION — data source: REAL API + LOCAL progress
 *
 * The follow API (`GET /mangas/follows`) already returns both
 * `lastReadChapter` and `latestChapter` per followed comic. Comparing the two
 * is the whole "new chapter alert" feature — no new endpoint needed.
 *
 * LOCAL progress is merged in because `lastReadChapter` is chapter-granular:
 * if the reader stopped mid-chapter, we can still point them at the exact page.
 */
import { unwrapList } from '~/lib/httpRequest';
import { getFollows } from '~/services/followService';
import { getMangaProgress } from '~/services/readingProgressService';
import { DAY_MS, timeAgo } from '~/lib/date';

const toNumber = (value) => {
  const n = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const toSlugKey = (value) => String(value ?? '').trim().toLowerCase();

/**
 * @returns {Promise<Array>} followed comics with unread chapters, newest first
 */
export async function getNewChapters(userId, { limit = 12 } = {}) {
  if (!userId) return [];

  let follows = [];
  try {
    const { data } = await getFollows({ userId });
    follows = unwrapList({ data });
  } catch {
    return [];
  }

  const now = Date.now();
  const items = follows
    .map((follow) => {
      const lastRead = toNumber(follow.lastReadChapter);
      const latest = toNumber(follow.latestChapter);
      if (lastRead === null || latest === null || latest <= lastRead) return null;

      const progress = getMangaProgress(follow.mangaPath);
      const chapterProgress = progress?.chapters?.[String(follow.lastReadChapter)] || null;
      const updatedAt = follow.updatedAt || follow.lastModified || null;

      return {
        id: `${follow.mangaPath}-${latest}`,
        mangaPath: follow.mangaPath,
        mangaName: follow.mangaName,
        thumbnailUrl: follow.thumbnailUrl,
        lastReadChapter: follow.lastReadChapter,
        latestChapter: follow.latestChapter,
        unreadCount: latest - lastRead,
        currentPage: chapterProgress?.currentPage || 0,
        totalPages: chapterProgress?.totalPages || 0,
        percent: chapterProgress?.percent || 0,
        releasedAt: updatedAt,
        releasedLabel: updatedAt ? timeAgo(updatedAt) : 'Vừa cập nhật',
        isRecent: updatedAt ? now - new Date(updatedAt).getTime() < 3 * DAY_MS : false,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.unreadCount - a.unreadCount);

  return items.slice(0, limit);
}

/**
 * Merges the REAL API continue list with LOCAL page-level progress.
 * The API knows *what* to continue; localStorage knows *where* to resume.
 * Local entries win on page data, API entries fill the gaps.
 */
export function mergeContinueReading({ apiItems = [], localItems = [] } = {}) {
  const merged = new Map();

  (apiItems || []).forEach((item) => {
    const key = toSlugKey(item.mangaPath);
    if (!key) return;
    merged.set(key, {
      mangaPath: item.mangaPath,
      mangaName: item.mangaName,
      thumbnailUrl: item.thumbnailUrl,
      chapterName: item.chapterName,
      readAt: item.readAt || item.updatedAt || null,
      currentPage: 0,
      totalPages: 0,
      percent: 0,
      chapterApiData: null,
      source: 'api',
    });
  });

  (localItems || []).forEach((item) => {
    const key = toSlugKey(item.mangaPath);
    if (!key) return;
    const existing = merged.get(key);
    const localIsNewer =
      !existing?.readAt || (item.readAt && new Date(item.readAt) > new Date(existing.readAt));

    merged.set(key, {
      mangaPath: item.mangaPath,
      mangaName: item.mangaName || existing?.mangaName || '',
      thumbnailUrl: item.thumbnailUrl || existing?.thumbnailUrl || '',
      chapterName: localIsNewer ? item.chapterName : existing?.chapterName || item.chapterName,
      readAt: localIsNewer ? item.readAt : existing?.readAt || item.readAt,
      currentPage: localIsNewer ? item.currentPage : existing?.currentPage || item.currentPage,
      totalPages: localIsNewer ? item.totalPages : existing?.totalPages || item.totalPages,
      percent: localIsNewer ? item.percent : existing?.percent || item.percent,
      completed: item.completed,
      chapterApiData: localIsNewer ? item.chapterApiData : existing?.chapterApiData || item.chapterApiData,
      source: localIsNewer ? 'local' : existing?.source || 'local',
    });
  });

  return Array.from(merged.values())
    .filter((item) => item.mangaPath)
    .sort((a, b) => new Date(b.readAt || 0) - new Date(a.readAt || 0));
}

const newChapterService = { getNewChapters, mergeContinueReading };

export default newChapterService;
