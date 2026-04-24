import React, { useEffect, useMemo, useState } from 'react';
import { AutoAwesomeRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './ReleaseCalendar.module.scss';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// Logic xác định Thứ hiện tại
const jsDay = new Date().getDay();
const todayMapping = [6, 0, 1, 2, 3, 4, 5]; 
const currentDayIndex = todayMapping[jsDay];

export default function ReleaseCalendar() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const [mangas, setMangas] = useState([]);
  const [activeDay, setActiveDay] = useState(currentDayIndex);

  useEffect(() => {
    let mounted = true;
    getMangasByCategory({ path: 'latest', page: 1 })
      .then((res) => {
        if (!mounted) return;
        setMangas((res?.result || []).slice(0, 28));
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
      isToday: idx === currentDayIndex,
      items: mangas.filter((_, i) => i % 7 === idx),
    }));
  }, [mangas]);

  const activeSchedule = schedule[activeDay];

  return (
    <main className={cx('calendarPage')}>
      <div className={cx('container-fluid')}>
        
        {/* HERO CINEMATIC */}
        <section className={cx('hero')}>
          <div className={cx('heroContent')}>
            <h1>
              Lịch Phát Hành <span>Hôm Nay</span>
            </h1>
            <p>Đừng bỏ lỡ bất kỳ chương truyện mới nào từ bộ sưu tập yêu thích của bạn.</p>
          </div>
        </section>

        {/* DAY TABS */}
        <div className={cx('dayTabs')}>
          {WEEK_DAYS.map((day, idx) => {
            const itemCount = schedule[idx]?.items.length || 0;
            return (
              <button
                key={day}
                className={cx('dayTab', { active: activeDay === idx, isToday: idx === currentDayIndex })}
                onClick={() => setActiveDay(idx)}
              >
                <span className={cx('dayName')}>{day}</span>
                <span className={cx('dayBadge')}>{itemCount}</span>
              </button>
            );
          })}
        </div>

        {/* MANGA GRID FOR ACTIVE TAB */}
        {activeSchedule?.items.length > 0 ? (
          <div className={cx('mangaGrid')}>
            {activeSchedule.items.map((item) => (
              <Link key={item.slug} to={`${paths.mangaDetail}?slug=${item.slug}`} className={cx('mangaCard')}>
                <div className={cx('mangaImgWrap')}>
                  <img 
                    src={item.thumb_url ? `${IMG_BASE_URL}${item.thumb_url}` : ''} 
                    alt={item.name} 
                    className={cx('mangaImg')} 
                  />
                  <span className={cx('newBadge')}>NEW</span>
                </div>
                <div className={cx('mangaInfo')}>
                  <div className={cx('mangaName')}>{item.name}</div>
                  <div className={cx('mangaMeta')}>
                    <AutoAwesomeRounded sx={{ fontSize: '1.3rem', color: '#ea982b' }} /> 
                    Đang cập nhật
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={cx('emptyState')}>
            <span className={cx('emptyIcon')}>🌙</span>
            <p>Chưa có lịch phát hành</p>
            <span>Hãy quay lại vào những ngày tiếp theo nhé!</span>
          </div>
        )}
      </div>
    </main>
  );
}