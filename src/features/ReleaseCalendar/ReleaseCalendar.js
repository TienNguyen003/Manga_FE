import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './ReleaseCalendar.module.scss';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export default function ReleaseCalendar() {
  const [mangas, setMangas] = useState([]);

  useEffect(() => {
    let mounted = true;
    getMangasByCategory({ path: 'latest', page: 1 })
      .then((res) => {
        if (!mounted) return;
        setMangas((res?.result || []).slice(0, 21));
      })
      .catch(() => {
        if (!mounted) return;
        setMangas([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const schedule = useMemo(() => {
    return WEEK_DAYS.map((day, idx) => ({
      day,
      items: mangas.filter((_, i) => i % 7 === idx).slice(0, 4),
    }));
  }, [mangas]);

  return (
    <main className={cx('calendarPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Lịch phát hành chương mới</h1>
          <p>Trang mới để theo dõi bộ truyện nào dự kiến cập nhật theo từng ngày trong tuần.</p>
        </section>

        <section className={cx('calendarGrid')}>
          {schedule.map((slot) => (
            <article key={slot.day} className={cx('dayCard')}>
              <h3>{slot.day}</h3>
              {slot.items.length > 0 ? (
                <ul>
                  {slot.items.map((item) => (
                    <li key={item.slug}>
                      <Link to={`${paths.mangaDetail}?slug=${item.slug}`}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cx('empty')}>Chưa có lịch phát hành.</p>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
