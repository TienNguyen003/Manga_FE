import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import Banner from './Banner';
import MediaSecttion from './MediaSecttion';
import InnerBanner from './InnerBanner';
import TopShow from './TopShow';
import { LoadingSpinner } from '~/components/common/AsyncState';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';
import { getHomeFeed } from '~/services/homeService';
import { getMangasByCategory } from '~/services/mangaService';
import { useUser } from '~/providers/UserContext';

const cx = classNames.bind(styles);

export default function Home() {
  const { userId } = useUser();
  const [homeFeed, setHomeFeed] = useState(null);
  const [feedLoading, setFeedLoading] = useState(true);

  // Fallback category sections cho khi chưa có home API
  const [articlesSection, setArticlesSection] = useState({});
  const [liveActionSection, setLiveActionSection] = useState({});
  const [popularSection, setPopularSection] = useState({});
  const [trendingSection, setTrendingSection] = useState({});
  const [topViewData, setTopViewData] = useState({});

  const arrayCategory = [
    { title: 'Manhua', subTitle: 'Kho truyện Trung Quốc đặc sắc', slug: 'manhua' },
    { title: 'Manhwa', subTitle: 'Truyện tranh Hàn Quốc hàng đầu', slug: 'manhwa' },
    { title: 'Romance', subTitle: 'Chuyện tình cảm lãng mạn', slug: 'romance' },
    { title: 'Drama', subTitle: 'Kịch tính, bất ngờ', slug: 'drama' },
    { title: 'Fantasy', subTitle: 'Thế giới phép thuật kỳ bí', slug: 'fantasy' },
  ];

  useEffect(() => {
    // Thử lấy home feed từ API mới
    setFeedLoading(true);
    getHomeFeed({ userId: userId || undefined })
      .then((res) => {
        if (res?.result) setHomeFeed(res.result);
      })
      .catch(() => {
        // Nếu lỗi, fallback sang load từng category
      })
      .finally(() => setFeedLoading(false));

    // Vẫn load category sections (dự phòng / fill thêm nếu home feed thiếu)
    arrayCategory.forEach((item) => getManga(item.title, item.subTitle, item.slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getManga = async (title, subTitle, slug) => {
    const res = await getMangasByCategory({ path: slug, page: 1 });
    const objectManga = { title, subTitle, slug, data: res?.result };
    switch (title) {
      case 'Manhua':
        setLiveActionSection(objectManga);
        break;
      case 'Manhwa':
        setPopularSection(objectManga);
        break;
      case 'Romance':
        setTopViewData(objectManga);
        break;
      case 'Drama':
        setTrendingSection(objectManga);
        break;
      case 'Fantasy':
        setArticlesSection(objectManga);
        break;
      default:
        break;
    }
  };

  const homeFeedSections = [
    {
      title: 'Mới cập nhật',
      subTitle: 'Những bộ truyện vừa lên chương mới nhất',
      slug: 'latest',
      data: homeFeed?.latestMangas || [],
    },
    {
      title: 'Đang HOT',
      subTitle: 'Các bộ truyện đang được theo dõi nhiều',
      slug: 'trending',
      data: homeFeed?.trendingMangas || [],
    },
    {
      title: 'Đánh giá cao',
      subTitle: 'Top truyện được cộng đồng chấm điểm tốt',
      slug: 'top-rated',
      data: homeFeed?.topRatedMangas || [],
    },
  ].filter((section) => section.data.length > 0);

  return (
    <div>
      <Banner />

      {/* ── Reuse MediaSecttion cho các block từ home feed ── */}
      {homeFeedSections.map((section) => (
        <MediaSecttion key={section.title} artic={section} />
      ))}

      {/* ── Continue reading (chỉ khi đã đăng nhập) ── */}
      {userId && homeFeed?.recentReadingHistory?.length > 0 && (
        <section className={cx('feedSection')}>
          <div className={cx('container-fluid')}>
            <div className={cx('sectionHeader')}>
              <h2 className={cx('sectionTitle')}>▶️ Tiếp tục đọc</h2>
              <Link to={paths.library} className={cx('viewAll')}>
                Thư viện
              </Link>
            </div>
            <div className={cx('mangaGrid')}>
              {homeFeed.recentReadingHistory.slice(0, 6).map((item, i) => (
                <Link key={i} to={`${paths.mangaDetail}?slug=${item.mangaPath}`} className={cx('continueCard')}>
                  <img src={item.thumbnailUrl || ''} alt={item.mangaName} className={cx('continueImg')} />
                  <div className={cx('continueInfo')}>
                    <div className={cx('continueName')}>{item.mangaName}</div>
                    {item.chapterName && <div className={cx('continueChap')}>Chương: {item.chapterName}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Category sections fallback / bổ sung ── */}
      <MediaSecttion artic={articlesSection} />
      <MediaSecttion artic={liveActionSection} />
      <InnerBanner />
      <MediaSecttion artic={popularSection} />
      <TopShow topShow={topViewData} />
      <MediaSecttion artic={trendingSection} />
    </div>
  );
}
