import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityService } from '~/services/communityService';
import classNames from 'classnames/bind';
import styles from './Community.module.scss';

const cx = classNames.bind(styles);

export default function Community() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    communityService
      .getTopics()
      .then((res) => {
        if (!mounted) return;
        setTopics(res?.result || []);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải danh sách chủ đề.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={cx('communityPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <p className={cx('tag')}>Trang mới</p>
          <h1>Cộng đồng sáng tác & thảo luận truyện</h1>
          <p>Nơi kết nối người đọc, dịch giả và người sáng tác.</p>
        </section>

        <section className={cx('topicGrid')}>
          {loading && <div>Đang tải chủ đề...</div>}
          {error && <div className={cx('error')}>{error}</div>}
          {!loading && !error && topics.length === 0 && <div>Chưa có chủ đề nào.</div>}
          {!loading &&
            !error &&
            topics.map((topic) => (
              <article key={topic.id} className={cx('topicCard')}>
                <h3>{topic.name}</h3>
                <p>{topic.postCount} bài viết</p>
                <button type="button" onClick={() => navigate(`/cong-dong/topic/${topic.id}`)}>
                  Xem thảo luận
                </button>
              </article>
            ))}
        </section>

        <section className={cx('roadmap')}>
          <h2>Gợi ý backend cho trang này</h2>
          <ul>
            <li>Danh sách chủ đề theo tag và lượt tương tác</li>
            <li>API tạo bài viết, bình luận, reaction</li>
            <li>Cơ chế kiểm duyệt nội dung và báo cáo vi phạm</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
