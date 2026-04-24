import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';
import paths from '~/routes/paths';
import { getHomeFeed } from '~/services/homeService';
import { getMangasByCategory } from '~/services/mangaService';
import { getPreferences } from '~/services/preferenceService';
import { useUser } from '~/providers/UserContext';

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
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    const loadFallbacks = async () => {
      const result = await Promise.all(
        categoryFallbacks.map(async (item) => {
          try {
            const res = await getMangasByCategory({ path: item.slug, page: 1 });
            return { title: item.title, subTitle: item.subTitle, slug: item.slug, data: res?.result || [] };
          } catch {
            return { title: item.title, subTitle: item.subTitle, slug: item.slug, data: [] };
          }
        }),
      );
      if (mounted) setFallbackSections(result.filter((section) => section.data.length > 0));
    };
    loadFallbacks();
    return () => {
      mounted = false;
    };
  }, [categoryFallbacks]);

  const homeFeedSections = [
    { title: 'Chương mới lên', subTitle: 'Cập nhật nhanh nhất', slug: 'latest', data: homeFeed?.latestMangas || [] },
    { title: 'Đang thịnh hành', subTitle: 'Lượt đọc cao trong ngày', slug: 'trending', data: homeFeed?.trendingMangas || [], isTrending: true },
    { title: 'Đánh giá cao', subTitle: 'Điểm cộng đồng tốt nhất', slug: 'top-rated', data: homeFeed?.topRatedMangas || [] },
  ].filter((section) => section.data.length > 0);

  const mergedSections = homeFeedSections.length > 0 ? homeFeedSections : fallbackSections;

  const heroManga = useMemo(() => {
    return homeFeed?.trendingMangas?.[0] || homeFeed?.latestMangas?.[0] || fallbackSections?.[0]?.data?.[0] || null;
  }, [homeFeed, fallbackSections]);

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

      {/* --- TIẾP TỤC ĐỌC --- */}
      {userId && homeFeed?.recentReadingHistory?.length > 0 && (
        <section className={cx('section', 'container-fluid')}>
          <header className={cx('sectionHead')}>
            <div>
              <h2>Tiếp tục đọc</h2>
              <p>Đừng bỏ dở những câu chuyện đang dang dở</p>
            </div>
          </header>
          <div className={cx('continueRail')}>
            {homeFeed.recentReadingHistory.slice(0, 10).map((item, i) => (
              <Link key={`${item.mangaPath}-${i}`} to={`${paths.mangaDetail}?slug=${item.mangaPath}`} className={cx('continueItem')}>
                <div className={cx('contThumbWrap')}>
                  <img src={(item.thumbnailUrl) ? `https://sv1.otruyencdn.com/${item.thumbnailUrl}` : ''} alt={item.mangaName} />
                </div>
                <div className={cx('contInfo')}>
                  <span className={cx('contName')}>{item.mangaName}</span>
                  <span className={cx('contChapter')}>
                    <i className="fa-solid fa-bookmark"></i> Chương {item.chapterName || '?'}
                  </span>
                  {/* Thanh progress giả lập */}
                  <div className={cx('progressBar')}>
                    <div className={cx('progressFill')} style={{ width: `${Math.floor(Math.random() * 60) + 30}%` }}></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --- LOADING --- */}
      {feedLoading && (
        <div className={cx('container-fluid')}>
          <div className={cx('loadingBox')}>Đang tải dữ liệu trang chủ...</div>
        </div>
      )}

      {/* --- MANGA SECTIONS --- */}
      {!feedLoading &&
        mergedSections.map((section) => (
          <section key={section.title} className={cx('section', 'container-fluid')}>
            <header className={cx('sectionHead')}>
              <div>
                <h2>{section.title}</h2>
                <p>{section.subTitle}</p>
              </div>
              <Link to={`${paths.category}?slug=${section.slug || ''}`}>Xem tất cả</Link>
            </header>

            <div className={cx('mangaGrid')}>
              {section.data.slice(0, 10).map((manga, idx) => (
                <Link key={`${manga.mangaPath || idx}`} to={`${paths.mangaDetail}?slug=${manga.mangaPath || manga.slug}`} className={cx('mangaCardWrap')}>
                  <div className={cx('mangaImgWrap')}>
                    <img src={manga.thumbnailUrl || manga.thumb_url ? `${IMG_BASE_URL}${manga.thumbnailUrl || manga.thumb_url}` : ''} alt={manga.name} className={cx('mangaImg')} />
                    {section.isTrending && idx < 3 && <div className={cx('rankBadge')}>#{idx + 1}</div>}
                  </div>
                  <div className={cx('mangaTitle')}>{manga.mangaName || manga.name}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}

      {/* --- EMPTY STATE --- */}
      {!feedLoading && mergedSections.length === 0 && (
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
