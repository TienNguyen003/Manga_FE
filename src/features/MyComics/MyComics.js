import React, { useEffect, useState } from 'react';
import { comicService } from '~/services/comicService';
import classNames from 'classnames/bind';
import styles from './MyComics.module.scss';

const cx = classNames.bind(styles);

export default function MyComics() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    comicService.getMyComics()
      .then((res) => {
        if (!mounted) return;
        setList(res?.data || []);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải danh sách truyện của bạn.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <main className={cx('myComicsPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Quản lý truyện của tôi</h1>
          <p>Xem, chỉnh sửa và quản lý các truyện bạn đã đăng.</p>
        </section>
        <section className={cx('listWrap')}>
          {loading && <div>Đang tải truyện...</div>}
          {error && <div className={cx('error')}>{error}</div>}
          {!loading && !error && list.length === 0 && <div>Chưa có truyện nào.</div>}
          {!loading && !error && list.map((item, idx) => (
            <div className={cx('item')} key={item.id || idx}>
              <div className={cx('title')}>{item.title}</div>
              <div className={cx('meta')}>
                <span>{item.status}</span>
                {/* Có thể bổ sung cover/chapter/views nếu API trả về */}
              </div>
              <div className={cx('actions')}>
                <button>Sửa</button>
                <button>Xóa</button>
                <button>Thêm chương</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
