import React, { useEffect, useState } from 'react';
import { comicService } from '~/services/comicService';
import classNames from 'classnames/bind';
import styles from './Recommendations.module.scss';

const cx = classNames.bind(styles);

export default function Recommendations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    comicService
      .getRecommendations()
      .then((res) => {
        if (!mounted) return;
        setList(res?.data || []);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải danh sách đề xuất.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={cx('recommendPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Gợi ý truyện cho bạn</h1>
          <p>Danh sách truyện được đề xuất dựa trên sở thích và lịch sử đọc của bạn.</p>
        </section>
        <section className={cx('listWrap')}>
          {loading && <div>Đang tải đề xuất...</div>}
          {error && <div className={cx('error')}>{error}</div>}
          {!loading &&
            !error &&
            list.map((item, idx) => (
              <div className={cx('item')} key={item.id || idx}>
                <div className={cx('name')}>{item.title}</div>
                <div className={cx('reason')}>{item.reason}</div>
                <button className={cx('readBtn')}>Đọc ngay</button>
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}
