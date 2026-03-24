import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';
import paths from '~/routes/paths';
import { getHomeFeed } from '~/services/homeService';
import { getMangasByCategory } from '~/services/mangaService';
import { getPreferences } from '~/services/preferenceService';
import { useUser } from '~/providers/UserContext';
import MangaCard from '~/components/common/MangaCard';

const cx = classNames.bind(styles);

export default function Home() {
  const { userId } = useUser();
  const [homeFeed, setHomeFeed] = useState(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [fallbackSections, setFallbackSections] = useState([]);
  const [categoryFallbacks, setCategoryFallbacks] = useState([
    { title: 'Manhwa', subTitle: 'Xu hướng nổi bật', slug: 'manhwa' },
    { title: 'Romance', subTitle: 'Được theo dõi nhiều', slug: 'romance' },
    { title: 'Fantasy', subTitle: 'Bảng đề cử biên tập', slug: 'fantasy' },
    { title: 'Drama', subTitle: 'Khung truyện nhiều cảm xúc', slug: 'drama' },
  ]);

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

  useEffect(() => {
    setFeedLoading(true);
    getHomeFeed({ userId: userId || undefined })
      .then((res) => {
        if (res?.result) setHomeFeed(res.result);
      })
      .catch(() => {})
      .finally(() => setFeedLoading(false));

    if (userId) {
      getPreferences({ userId })
        .then((res) => {
          const pref = res?.result || {};
          const categories = pref.favoriteCategories || pref.preferredCategories || [];
          if (Array.isArray(categories) && categories.length > 0) {
            setCategoryFallbacks(
              categories.slice(0, 4).map((slug) => ({
                title: String(slug).charAt(0).toUpperCase() + String(slug).slice(1),
                subTitle: 'Gợi ý theo gu đọc của bạn',
                slug,
              })),
            );
          }
        })
        .catch(() => {});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const loadFallbacks = async () => {
      const result = await Promise.all(
        categoryFallbacks.map(async (item) => {
          try {
            const res = await getMangasByCategory({ path: item.slug, page: 1 });
            return {
              title: item.title,
              subTitle: item.subTitle,
              slug: item.slug,
              data: res?.result || [],
            };
          } catch {
            return {
              title: item.title,
              subTitle: item.subTitle,
              slug: item.slug,
              data: [],
            };
          }
        }),
      );

      if (mounted) {
        setFallbackSections(result.filter((section) => section.data.length > 0));
      }
    };

    loadFallbacks();

    return () => {
      mounted = false;
    };
  }, [categoryFallbacks]);

  const homeFeedSections = [
    {
      title: 'Chương mới lên',
      subTitle: 'Dữ liệu từ feed cập nhật mới nhất',
      slug: 'latest',
      data: homeFeed?.latestMangas || [],
    },
    {
      title: 'Đang được theo dõi',
      subTitle: 'Các bộ có lượt đọc cao trong ngày',
      slug: 'trending',
      data: homeFeed?.trendingMangas || [],
    },
    {
      title: 'Đánh giá cao',
      subTitle: 'Ưu tiên bộ có điểm cộng đồng tốt',
      slug: 'top-rated',
      data: homeFeed?.topRatedMangas || [],
    },
  ].filter((section) => section.data.length > 0);

  const mergedSections = homeFeedSections.length > 0 ? homeFeedSections : fallbackSections;

  const heroManga = useMemo(() => {
    return homeFeed?.trendingMangas?.[0] || homeFeed?.latestMangas?.[0] || fallbackSections?.[0]?.data?.[0] || null;
  }, [homeFeed, fallbackSections]);

  const quickNumbers = [
    { label: 'Bộ theo dõi hằng ngày', value: '12.8K' },
    { label: 'Bản phát hành tháng này', value: '780+' },
    { label: 'Nhóm dịch đang hoạt động', value: '96' },
  ];

  return (
    <main className={cx('homePage')}>
      <section className={cx('heroPanel', 'container-fluid')}>
        <div className={cx('introCol')}>
          <p className={cx('kicker')}>Giao diện mới toàn diện</p>
          <h1>Trạm đọc truyện thế hệ mới, gom mọi thứ vào một luồng rõ ràng</h1>
          <p>Trang chủ được dựng lại từ đầu theo hướng tạp chí số: ưu tiên nội dung, ưu tiên tracking, ưu tiên thao tác nhanh thay vì layout cũ.</p>

          <div className={cx('heroActions')}>
            <Link to={paths.discover} className={cx('solidBtn')}>
              Mở khu khám phá
            </Link>
            <Link to={paths.library} className={cx('outlineBtn')}>
              Đi tới thư viện
            </Link>
          </div>

          <div className={cx('metricRow')}>
            {quickNumbers.map((item) => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className={cx('spotlightCol')}>
          {heroManga ? (
            <Link to={`${paths.mangaDetail}?slug=${heroManga.mangaPath}`} className={cx('spotlightCard')}>
              {heroManga.thumbnailUrl ? (
                <img src={`${IMG_BASE_URL}${heroManga.thumbnailUrl}`} alt={heroManga.mangaName} className={cx('spotlightCover')} />
              ) : (
                <div className={cx('coverFallback')}>
                  <i className="fa-regular fa-image"></i>
                </div>
              )}
              <div className={cx('spotlightOverlay')}>
                <small>Tựa nổi bật hôm nay</small>
                <h3>{heroManga.name}</h3>
              </div>
            </Link>
          ) : (
            <div className={cx('spotlightCard', 'emptySpotlight')}>
              <div className={cx('coverFallback')}>
                <i className="fa-solid fa-book-open"></i>
              </div>
              <div className={cx('spotlightOverlay')}>
                <small>Đang chờ dữ liệu feed</small>
                <h3>Kết nối API để hiển thị truyện đề cử</h3>
              </div>
            </div>
          )}
        </div>
      </section>

      {userId && homeFeed?.recentReadingHistory?.length > 0 && (
        <section className={cx('section', 'container-fluid')}>
          <header className={cx('sectionHead')}>
            <h2>Tiếp tục từ chương đang đọc</h2>
            <Link to={paths.library}>Mở lịch sử đọc</Link>
          </header>
          <div className={cx('continueRail')}>
            {homeFeed.recentReadingHistory.slice(0, 8).map((item, i) => (
              <Link key={`${item.mangaPath}-${i}`} to={`${paths.mangaDetail}?slug=${item.mangaPath}`} className={cx('continueItem')}>
                <span>{item.mangaName}</span>
                <small>{item.chapterName || 'Đang đọc dở'}</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      {feedLoading && (
        <section className={cx('section', 'container-fluid')}>
          <div className={cx('stateBox')}>Đang tải trang chủ mới...</div>
        </section>
      )}

      {!feedLoading &&
        mergedSections.map((section) => (
          <section key={section.title} className={cx('section', 'container-fluid')}>
            {console.log('Rendering section:', section)}
            <header className={cx('sectionHead')}>
              <div>
                <h2>{section.title}</h2>
                <p>{section.subTitle}</p>
              </div>
              <Link to={`${paths.category}?slug=${section.slug || ''}`}>Xem toàn bộ</Link>
            </header>

            <div className={cx('mangaGrid')}>
              {section.data.slice(0, 10).map((manga, idx) => (
                <MangaCard key={`${manga.mangaPath || manga.mangaName}-${idx}`} manga={manga} rank={section.mangaPath === 'trending' ? idx + 1 : undefined} />
              ))}
            </div>
          </section>
        ))}

      {!feedLoading && mergedSections.length === 0 && (
        <section className={cx('section', 'container-fluid')}>
          <div className={cx('stateBox')}>
            <h3>Chưa có dữ liệu để dựng block truyện</h3>
            <p>Bạn có thể đi tới danh mục để xác nhận API trả dữ liệu trước khi bật feed trang chủ.</p>
            <Link to={paths.category} className={cx('solidBtn')}>
              Đi tới danh mục
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
