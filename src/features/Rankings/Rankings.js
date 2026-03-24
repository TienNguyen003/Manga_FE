import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './Rankings.module.scss';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

export default function Rankings() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getMangasByCategory({ path: 'trending', page: 1 })
      .then((res) => {
        if (!mounted) return;
        setMangas(res?.result || []);
      })
      .catch(() => {
        if (!mounted) return;
        setMangas([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const top10 = useMemo(() => mangas.slice(0, 10), [mangas]);

  return (
    <main className={cx('rankingsPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Bảng xếp hạng truyện tuần</h1>
          <p>Trang mới dành cho người đọc theo dõi bộ nào đang hot nhất theo thời điểm.</p>
        </section>

        {loading && <div className={cx('loading')}>Đang cập nhật bảng xếp hạng...</div>}

        {!loading && top10.length === 0 && <div className={cx('loading')}>Chưa có dữ liệu xếp hạng.</div>}

        {!loading && top10.length > 0 && (
          <section className={cx('listWrap')}>
            {top10.map((item, idx) => (
              <Link to={`${paths.mangaDetail}?slug=${item.slug}`} key={item.slug || idx} className={cx('rankItem')}>
                <div className={cx('rankNo')}>#{idx + 1}</div>
                <img src={item.thumb_url ? `${IMG_BASE_URL}${item.thumb_url}` : ''} alt={item.name} className={cx('cover')} />
                <div className={cx('meta')}>
                  <h3>{item.name}</h3>
                  <div className={cx('tags')}>
                    <span>{item.status || 'Đang cập nhật'}</span>
                    <span>⭐ {item.score || 0}</span>
                  </div>
                </div>
                <div className={cx('arrow')}>Xem</div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
