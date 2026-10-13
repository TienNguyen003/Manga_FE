import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import ContinueReadingRail from '~/components/reading/ContinueReadingRail';
import DailyChallengesCard from '~/components/reading/DailyChallengesCard';
import LevelProgress from '~/components/reading/LevelProgress';
import NewChaptersRail from '~/components/reading/NewChaptersRail';
import ReadingGoalCard from '~/components/reading/ReadingGoalCard';
import StreakCalendar from '~/components/reading/StreakCalendar';
import { LoadingSpinner } from '~/components/common/AsyncState';
import { useReaderStats } from '~/providers/ReaderStatsProvider';
import { useUser } from '~/providers/UserContext';
import { unwrapList } from '~/lib/httpRequest';
import { getMangasByCategory } from '~/services/mangaService';
import { getPreferences } from '~/services/preferenceService';
import { greeting } from '~/lib/date';
import smartRecommendationService from '~/services/smartRecommendationService';
import paths from '~/routes/paths';
import styles from './Home.module.scss';

const cx = classNames.bind(styles);

// The recommendation service already normalises its own payloads; this keeps the
// anonymous category fallback on the exact same shape so one renderer serves both.
const normalise = (m) => ({
  ...m,
  slug: m.mangaPath || m.slug,
  title: m.mangaName || m.name,
  thumb: m.thumbnailUrl || m.thumb_url,
});

export default function Home() {
  const { userId, userData } = useUser();
  const { genres: localGenres } = useReaderStats();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genrePrefs, setGenrePrefs] = useState([]);
  const [fallbackSections, setFallbackSections] = useState([]);

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

  // REAL API: favourite categories -> genre shelves ("Trending in your genres")
  useEffect(() => {
    if (!userId) return;
    getPreferences({ userId })
      .then(({ data }) => {
        const pref = data?.result ?? {};
        const categories = pref.favoriteCategories || pref.preferredCategories || [];
        if (Array.isArray(categories) && categories.length) {
          setGenrePrefs(
            categories.slice(0, 4).map((slug) => ({
              name: String(slug).charAt(0).toUpperCase() + String(slug).slice(1),
              slug,
            })),
          );
        }
      })
      .catch(() => {});
  }, [userId]);

  // Personalised rails. Degrades section-by-section, never blanks the page.
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Prefer locally-derived genres; fall back to the server preference.
    const genres = localGenres.length
      ? localGenres.map((g) => ({ name: g.name, slug: String(g.name).toLowerCase().replace(/\s+/g, '-') }))
      : genrePrefs;

    smartRecommendationService
      .buildHomeSections({ userId, genres })
      .then((list) => {
        if (mounted) setSections(list);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [userId, genrePrefs, localGenres]);

  // Anonymous / failed state: keep the original category shelves.
  useEffect(() => {
    if (sections.length > 0) return;
    const defaults = [
      { title: 'Manhwa', subTitle: 'Xu hướng nổi bật', slug: 'manhwa' },
      { title: 'Romance', subTitle: 'Được theo dõi nhiều', slug: 'romance' },
      { title: 'Fantasy', subTitle: 'Bảng đề cử biên tập', slug: 'fantasy' },
      { title: 'Drama', subTitle: 'Khung truyện nhiều cảm xúc', slug: 'drama' },
    ];
    Promise.all(
      defaults.map(async (item) => {
        try {
          // `page` is 0-BASED (Rule 2).
          const { data } = await getMangasByCategory({ path: item.slug, page: 0 });
          return { ...item, items: unwrapList({ data }).map(normalise) };
        } catch {
          return { ...item, items: [] };
        }
      }),
    ).then((result) => setFallbackSections(result.filter((s) => s.items.length > 0)));
  }, [sections.length]);

  const rails = useMemo(
    () => (sections.length > 0 ? sections : fallbackSections.map((s) => ({ ...s, to: `/category?slug=${s.slug}` }))),
    [sections, fallbackSections],
  );

  const heroManga = useMemo(() => {
    const trending = sections.find((s) => s.id === 'trending') || sections.find((s) => s.id === 'recommended');
    return trending?.items?.[0] || rails?.[0]?.items?.[0] || null;
  }, [sections, rails]);

  const displayName = userData?.name || userData?.displayName || 'bạn';

  return (
    <main className={cx('homePage')}>
      {/* --- HERO CINEMATIC MAGAZINE --- */}
      <section className={cx('heroPanel', 'container-fluid')}>
        <div className={cx('heroBg')}>
          {heroManga?.thumbnailUrl ? (
            <img src={`${IMG_BASE_URL}${heroManga.thumbnailUrl}`} alt="Hero Background" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a, #334155)' }} />
          )}
        </div>

        <div className={cx('heroContent')}>
          <span className={cx('kicker')}>
            <i className="fa-solid fa-sparkles"></i> Không Gian Cá Nhân Hóa
          </span>
          <h1 className={cx('heroTitle')}>
            Thế Giới Truyện, <span>Chỉ Có Thể Là Bạn</span>
          </h1>
          <p className={cx('heroDesc')}>Dừng lại một chút. Bỏ lại bộn bề ngoài kia và đắm chìm vào hàng ngàn câu chuyện được lựa chọn riêng cho bạn.</p>

          <div className={cx('heroActions')}>
            <Link to={paths.discover} className={cx('solidBtn')}>
              <i className="fa-solid fa-compass"></i> Khám phá ngay
            </Link>
            <Link to={paths.library} className={cx('outlineBtn')}>
              <i className="fa-solid fa-book-bookmark"></i> Thư viện của tôi
            </Link>
          </div>
        </div>
      </section>

      {/* --- CHÀO MỪNG + NHANH CHÓNG ĐỌC (logged-in only) --- */}
      {userId && (
        <section className={cx('section', 'container-fluid')}>
          <header className={cx('sectionHead')}>
            <div>
              <h2>
                {greeting()}, {displayName} 👋
              </h2>
              <p>Tiếp tục đúng chỗ bạn đang dở — không tốn thời gian tìm lại.</p>
            </div>
            <Link to={paths.dashboard}>Tổng quan →</Link>
          </header>

          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardMain}>
              <ContinueReadingRail showHeader={false} limit={5} />
            </div>
            <div className={styles.dashboardSide}>
              <LevelProgress size="sm" />
              <ReadingGoalCard compact showPresets={false} />
            </div>
          </div>
        </section>
      )}

      {/* --- CHUỖI ĐỌC + THỬ THÁCH --- */}
      {userId && (
        <section className={cx('section', 'container-fluid')}>
          <div className={styles.retentionGrid}>
            <StreakCalendar />
            <DailyChallengesCard />
          </div>
        </section>
      )}

      {/* --- CHƯƠNG MỚI TỪ THƯ VIỆN (REAL API: /mangas/follows) --- */}
      {userId && (
        <section className={cx('section', 'container-fluid')}>
          <NewChaptersRail />
        </section>
      )}

      {/* --- LOADING --- */}
      {loading && (
        <div className={cx('container-fluid')}>
          <LoadingSpinner text="Đang tải dữ liệu trang chủ..." />
        </div>
      )}

      {/* --- PERSONALISED RAILS (with the reason shown on every section) --- */}
      {!loading &&
        rails.map((section) => (
          <section key={section.id || section.title} className={cx('section', 'container-fluid')}>
            <header className={cx('sectionHead')}>
              <div>
                <h2>{section.title}</h2>
                <p>{section.subtitle || section.subTitle}</p>
              </div>
              {section.to && <Link to={section.to}>Xem tất cả</Link>}
            </header>

            <div className={cx('mangaGrid')}>
              {section.items.slice(0, 14).map((manga, idx) => (
                <Link
                  key={`${manga.slug || manga.mangaPath || idx}`}
                  to={`${paths.mangaDetail}?slug=${manga.slug || manga.mangaPath}`}
                  className={cx('mangaCardWrap')}
                >
                  <div className={cx('mangaImgWrap')}>
                    <img
                      src={
                        manga.thumb || manga.thumbnailUrl || manga.thumb_url
                          ? `${IMG_BASE_URL}${manga.thumb || manga.thumbnailUrl || manga.thumb_url}`
                          : ''
                      }
                      alt={manga.title || manga.name}
                      className={cx('mangaImg')}
                    />
                    {section.id === 'trending' && idx < 3 && <div className={cx('rankBadge')}>#{idx + 1}</div>}
                  </div>
                  <div className={cx('mangaTitle')}>{manga.title || manga.name || manga.mangaName}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}

      {/* --- CTA: giảm thời gian từ "mở web" đến "bắt đầu đọc" --- */}
      {!loading && (
        <section className={cx('section', 'container-fluid')}>
          <div className={styles.ctaCard}>
            <div>
              <h3 className={styles.ctaTitle}>Không biết nên đọc gì tiếp?</h3>
              <p className={styles.ctaText}>Trả lời 3 câu, nhận danh sách truyện hợp với tâm trạng của bạn ngay lập tức.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link to={paths.whatToReadNext} className={styles.ctaPrimary}>
                Tìm truyện cho tôi
              </Link>
              <Link to={paths.membership} className={styles.ctaGhost}>
                Xem gói Premium
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- EMPTY STATE --- */}
      {!loading && rails.length === 0 && (
        <section className={cx('section', 'container-fluid')}>
          <div className={cx('stateBox')}>
            <h3>Chưa có dữ liệu</h3>
            <p>Kết nối API hoặc khám phá danh mục để bắt đầu.</p>
            <Link to={paths.category} className={cx('solidBtn')}>
              Đi tới Danh mục
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
