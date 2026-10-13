/**
 * SMART RECOMMENDATION SECTIONS - data source: REAL APIs only
 *
 * Nothing here invents a model. Every comic comes from an endpoint the backend
 * already exposes. The only thing this service adds is *context*: which
 * history item / genre / follow caused a recommendation to appear, so the UI
 * can say "Vi ban doc One Piece" instead of a bare "Recommended" grid.
 *
 * Sources (all real):
 *   GET /recommendations/mangas   -> personalised picks
 *   GET /mangas/home              -> trending / latest / top-rated
 *   GET /mangas/history           -> what the reader actually read
 *   GET /mangas/categories        -> genre taxonomy
 *   GET /mangas/category?path=    -> a genre shelf
 */
import { getRecommendationsMangas } from '~/services/recommendationService';
import { getMangasByCategory, getCategories, getHomeFeed } from '~/services/mangaService';
import { getHistory } from '~/services/historyService';
import { getFollows } from '~/services/followService';

const slugOf = (m) => m?.mangaPath || m?.slug || '';
const nameOf = (m) => m?.mangaName || m?.name || m?.title || '';

const normalise = (m) => ({
  ...m,
  slug: slugOf(m),
  title: nameOf(m),
  thumb: m?.thumbnailUrl || m?.thumb_url || m?.cover || '',
});

const uniqueBySlug = (list) => {
  const seen = new Set();
  return list.filter((m) => {
    const slug = slugOf(m);
    if (!slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
};

const safe = async (promise, fallback) => {
  try {
    const { data } = await promise;
    return data?.result ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Build every personalised rail for Home in parallel.
 * Each section degrades independently - one failing endpoint never blanks Home.
 */
export async function buildHomeSections({ userId, genres = [] } = {}) {
  const historyPromise = userId ? safe(getHistory({ userId }), []) : Promise.resolve([]);
  const recPromise = safe(getRecommendationsMangas({ userId: userId || undefined, limit: 20 }), []);
  const homePromise = safe(getHomeFeed({ userId: userId || undefined }), {});
  const followsPromise = userId ? safe(getFollows({ userId }), []) : Promise.resolve([]);

  const [historyRaw, recRaw, homeFeed, follows] = await Promise.all([
    historyPromise,
    recPromise,
    homePromise,
    followsPromise,
  ]);

  const history = uniqueBySlug((Array.isArray(historyRaw) ? historyRaw : []).map(normalise));
  const followsList = uniqueBySlug((Array.isArray(follows) ? follows : []).map(normalise));
  const seenSlugs = new Set([...history, ...followsList].map(slugOf));

  // Anchor comics the reader actually engaged with, newest first.
  const anchors = history.slice(0, 4);
  const recommendations = uniqueBySlug(Array.isArray(recRaw) ? recRaw.map(normalise) : []);
  const trending = uniqueBySlug((homeFeed?.trendingMangas || []).map(normalise));
  const latest = uniqueBySlug((homeFeed?.latestMangas || []).map(normalise));
  const topRated = uniqueBySlug((homeFeed?.topRatedMangas || []).map(normalise));

  const sections = [];

  if (recommendations.length) {
    sections.push({
      id: 'recommended',
      title: 'Đề xuất cho bạn',
      subtitle: 'Dựa trên lịch sử đọc và đánh giá của bạn',
      reason: 'Chọn lọc từ hành vi đọc của bạn',
      items: recommendations.slice(0, 14),
      to: '/goi-y',
    });
  }

  anchors.forEach((anchor) => {
    const items = recommendations.filter((m) => m.slug !== anchor.slug).slice(0, 10);
    if (items.length) {
      sections.push({
        id: `because-${anchor.slug}`,
        title: `Vì bạn đọc ${anchor.title}`,
        subtitle: 'Truyện đề xuất cùng gu với bạn',
        reason: `Vì bạn đọc ${anchor.title}`,
        items,
        to: null,
      });
    }
  });

  const followedTitles = new Set(followsList.map(nameOf));
  const fromLibrary = latest.filter((m) => followedTitles.has(m.title) || seenSlugs.has(m.slug));
  if (fromLibrary.length) {
    sections.push({
      id: 'library-updates',
      title: 'Chương mới từ thư viện của bạn',
      subtitle: 'Truyện bạn theo dõi vừa có chương mới',
      reason: 'Từ danh sách theo dõi',
      items: uniqueBySlug(fromLibrary).slice(0, 14),
      to: '/thong-bao',
    });
  }

  if (trending.length) {
    sections.push({
      id: 'trending',
      title: 'Đang thịnh hành',
      subtitle: 'Lượt đọc cao nhất hôm nay',
      reason: 'Thị hành toàn cộng đồng',
      items: trending.slice(0, 14),
      to: '/bang-xep-hang',
    });
  }
  if (genres.length) {
    const genreShelves = await Promise.all(
      genres.slice(0, 2).map(async (genre) => {
        const list = await safe(getMangasByCategory({ path: genre.slug, page: 0 }), []);
        const items = uniqueBySlug((Array.isArray(list) ? list : []).map(normalise)).slice(0, 12);
        return items.length
          ? {
              id: `genre-${genre.slug}`,
              title: `Trending trong ${genre.name}`,
              subtitle: 'Thể loại bạn đọc nhiều nhất',
              reason: `Bạn thường đọc ${genre.name}`,
              items,
              to: `/category?slug=${genre.slug}`,
            }
          : null;
      }),
    );
    sections.push(...genreShelves.filter(Boolean));
  }

  if (topRated.length) {
    sections.push({
      id: 'top-rated',
      title: 'Đánh giá cao nhất',
      subtitle: 'Điểm cộng đồng tốt nhất',
      reason: 'Được cộng đồng đánh giá cao',
      items: topRated.slice(0, 14),
      to: '/bang-xep-hang',
    });
  }

  return sections;
}

/** Fallback genre list when the reader has no local history yet. */
export async function getExploreGenres(limit = 12) {
  const categories = await safe(getCategories(), []);
  if (!Array.isArray(categories) || !categories.length) return [];
  return categories.slice(0, limit).map((c) => ({
    name: c.name,
    slug: c.slug || String(c.name).toLowerCase().replace(/\s+/g, '-'),
  }));
}

const smartRecommendationService = { buildHomeSections, getExploreGenres };

export default smartRecommendationService;
