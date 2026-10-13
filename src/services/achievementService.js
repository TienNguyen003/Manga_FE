/**
 * ACHIEVEMENTS — data source: LOCAL (derived)
 *
 * The backend HAS an admin badge API (`/admin/badges`) but that models
 * *curated role/author badges* assigned by admins, NOT reader-driven
 * achievements. So achievement *state* is derived, not stored: we recompute
 * progress from local reading stats + real API stats, and only the list of
 * "newly unlocked" ids is persisted (to fire a one-time celebration).
 *
 * Deriving instead of storing means the UI can never show a stale "72/100".
 */
import { getLocalStats } from '~/services/readingProgressService';

export const ACHIEVEMENT_CATALOG = [
  {
    id: 'first-read',
    icon: '🏆',
    name: 'Lần đầu đọc',
    description: 'Mở chương truyện đầu tiên',
    target: 1,
    metric: 'chaptersRead',
    xp: 20,
  },
  {
    id: 'first-comic-completed',
    icon: '📗',
    name: 'Hoàn thành truyện đầu tiên',
    description: 'Đọc xong một bộ truyện',
    target: 1,
    metric: 'completedComics',
    xp: 60,
  },
  {
    id: 'comic-collector',
    icon: '🏛️',
    name: 'Người sưu tầm',
    description: 'Hoàn thành 10 bộ truyện',
    target: 10,
    metric: 'completedComics',
    xp: 200,
  },
  {
    id: 'chapter-25',
    icon: '📖',
    name: 'Mới bắt đầu',
    description: 'Đọc 25 chương',
    target: 25,
    metric: 'chaptersRead',
    xp: 40,
  },
  {
    id: 'chapter-100',
    icon: '📚',
    name: '100 chương',
    description: 'Đọc 100 chương',
    target: 100,
    metric: 'chaptersRead',
    xp: 120,
  },
  {
    id: 'chapter-500',
    icon: '🏛️',
    name: '500 chương',
    description: 'Đọc 500 chương',
    target: 500,
    metric: 'chaptersRead',
    xp: 400,
  },
  {
    id: 'pages-1000',
    icon: '🧻',
    name: '1000 trang',
    description: 'Đọc 1000 trang truyện',
    target: 1000,
    metric: 'pagesRead',
    xp: 100,
  },
  {
    id: 'pages-10000',
    icon: '🏔️',
    name: '10.000 trang',
    description: 'Đọc 10.000 trang truyện',
    target: 10000,
    metric: 'pagesRead',
    xp: 500,
  },
  {
    id: 'streak-3',
    icon: '🔥',
    name: 'Chuỗi 3 ngày',
    description: 'Đọc liên tiếp 3 ngày',
    target: 3,
    metric: 'streak',
    xp: 40,
  },
  {
    id: 'streak-7',
    icon: '🔥',
    name: 'Chuỗi 7 ngày',
    description: 'Đọc liên tiếp 7 ngày',
    target: 7,
    metric: 'streak',
    xp: 100,
  },
  {
    id: 'streak-30',
    icon: '⚡',
    name: 'Chuỗi 30 ngày',
    description: 'Đọc liên tiếp 30 ngày',
    target: 30,
    metric: 'streak',
    xp: 300,
  },
  {
    id: 'night-reader',
    icon: '🌙',
    name: 'Đọc đêm',
    description: 'Đọc truyện lúc 22:00–05:00',
    target: 10,
    metric: 'nightChapters',
    xp: 50,
  },
  {
    id: 'weekend-reader',
    icon: '🎉',
    name: 'Cuối tuần không ngủ',
    description: 'Đọc truyện vào cuối tuần',
    target: 10,
    metric: 'weekendChapters',
    xp: 50,
  },
  {
    id: 'genre-explorer',
    icon: '🧭',
    name: 'Nhà thám hiểm thể loại',
    description: 'Đọc truyện của 5 thể loại khác nhau',
    target: 5,
    metric: 'genresExplored',
    xp: 70,
  },
  {
    id: 'critic',
    icon: '✍️',
    name: 'Nhà phê bình',
    description: 'Viết 10 đánh giá',
    target: 10,
    metric: 'ratings',
    xp: 60,
  },
  {
    id: 'community-voice',
    icon: '💬',
    name: 'Tiếng nói cộng đồng',
    description: 'Viết 20 bình luận',
    target: 20,
    metric: 'comments',
    xp: 60,
  },
  {
    id: 'loyal-fan',
    icon: '🫶',
    name: 'Fan trung thành',
    description: 'Theo dõi 20 truyện',
    target: 20,
    metric: 'follows',
    xp: 80,
  },
];

export const ACHIEVEMENT_MAP = ACHIEVEMENT_CATALOG.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});


/**
 * Build the metric map achievements are evaluated against.
 * @param {object} remoteStats real API counters (from `/mangas/dashboard`)
 */
export function buildMetricMap(remoteStats = {}) {
  const local = getLocalStats();
  return {
    chaptersRead: local.totalChaptersRead,
    pagesRead: local.totalPagesRead,
    completedComics: local.completedComics,
    readingMinutes: local.totalMinutes,
    nightChapters: local.nightChapters,
    weekendChapters: local.weekendChapters,
    genresExplored: Object.keys(local.genres || {}).length,
    streak: Math.max(local.localStreak || 0, remoteStats.readingStreak || 0),
    ratings: remoteStats.totalRatings || 0,
    comments: remoteStats.totalComments || 0,
    follows: remoteStats.totalFollows || 0,
  };
}

/**
 * Evaluate the whole catalog against current metrics.
 * Returns items with `unlocked`, `progress`, `percent` so the UI can show
 * "Read 72 / 100 chapters" for a locked badge without any extra storage.
 */
export function evaluateAchievements(remoteStats = {}) {
  const metrics = buildMetricMap(remoteStats);
  return ACHIEVEMENT_CATALOG.map((item) => {
    const current = Math.max(0, Number(metrics[item.metric]) || 0);
    const unlocked = current >= item.target;
    return {
      ...item,
      current: Math.min(current, item.target),
      rawCurrent: current,
      unlocked,
      percent: unlocked ? 100 : Math.min(99, Math.round((current / item.target) * 100)),
      progressLabel: `${Math.min(current, item.target)} / ${item.target}`,
    };
  });
}

export function getAchievementSummary(remoteStats = {}) {
  const list = evaluateAchievements(remoteStats);
  const unlocked = list.filter((a) => a.unlocked);
  return {
    list,
    unlockedCount: unlocked.length,
    totalCount: list.length,
    nextUp: list
      .filter((a) => !a.unlocked)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3),
  };
}

const achievementService = {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_MAP,
  buildMetricMap,
  evaluateAchievements,
  getAchievementSummary,
};

export default achievementService;
