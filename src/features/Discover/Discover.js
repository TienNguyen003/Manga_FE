import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './Discover.module.scss';
import paths from '~/routes/paths';
import MangaCard from '~/components/common/MangaCard';
import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

const DISCOVER_BLOCKS = [
  { title: 'Thế giới Manhwa', slug: 'manhwa', desc: 'Những bộ truyện Hàn Quốc có nét vẽ đẹp và nhịp nhanh.' },
  { title: 'Kỳ ảo Fantasy', slug: 'fantasy', desc: 'Không gian phép thuật, hệ thống và phiêu lưu đỉnh cao.' },
  { title: 'Tình cảm Romance', slug: 'romance', desc: 'Các câu chuyện cảm xúc nhẹ nhàng đến bùng nổ.' },
];

export default function Discover() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await Promise.all(
        DISCOVER_BLOCKS.map(async (block) => {
          try {
            const res = await getMangasByCategory({ path: block.slug, page: 1 });
            return { ...block, mangas: (res?.result || []).slice(0, 8) };
          } catch {
            return { ...block, mangas: [] };
          }
        }),
      );

      if (mounted) {
        setSections(data);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={cx('discoverPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <p className={cx('kicker')}>Trang mới</p>
          <h1>Khám phá truyện theo vibe bạn thích</h1>
          <p>Tổng hợp các tuyển tập theo màu truyện để người đọc mới vào là chọn được ngay gu phù hợp.</p>
          <Link to={paths.category} className={cx('heroBtn')}>
            Xem toàn bộ danh mục
          </Link>
        </section>

        {loading && <div className={cx('loading')}>Đang tải gợi ý khám phá...</div>}

        {!loading &&
          sections.map((section) => (
            <section key={section.slug} className={cx('section')}>
              <div className={cx('sectionHead')}>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.desc}</p>
                </div>
                <Link to={`${paths.category}?slug=${section.slug}`}>Mở danh mục</Link>
              </div>

              {section.mangas.length > 0 ? (
                <div className={cx('grid')}>
                  {section.mangas.map((manga, idx) => (
                    <MangaCard key={`${section.slug}-${manga.slug || idx}`} manga={manga} />
                  ))}
                </div>
              ) : (
                <div className={cx('empty')}>Chưa có dữ liệu cho mục này.</div>
              )}
            </section>
          ))}
      </div>
    </main>
  );
}
