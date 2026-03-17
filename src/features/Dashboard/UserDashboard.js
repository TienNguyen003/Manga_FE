import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './UserDashboard.module.scss';
import { useUser } from '~/providers/UserContext';
import { getDashboard } from '~/services/dashboardService';
import { LoadingSpinner, EmptyState, ErrorState } from '~/components/common/AsyncState';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

const STAT_CONFIG = [
  { key: 'totalFollows', label: 'Đang theo dõi', icon: '🔖', color: '#3b82f6' },
  { key: 'totalReadingHistory', label: 'Đã đọc', icon: '📖', color: '#10b981' },
  { key: 'totalComments', label: 'Bình luận', icon: '💬', color: '#f59e0b' },
  { key: 'totalRatings', label: 'Đánh giá', icon: '⭐', color: '#8b5cf6' },
  { key: 'unreadNotifications', label: 'Thông báo mới', icon: '🔔', color: '#ef4444' },
];

export default function UserDashboard() {
  const { userId, username } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboard({ userId });
      setData(res?.result || res);
    } catch {
      setError('Không thể tải trang tổng quan. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!userId) {
    return (
      <div className={cx('wrapper')}>
        <div className={cx('container-fluid')}>
          <EmptyState icon="🔒" text="Vui lòng đăng nhập để xem trang tổng quan." />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cx('wrapper')}>
        <div className={cx('container-fluid')}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('wrapper')}>
        <div className={cx('container-fluid')}>
          <ErrorState text={error} onRetry={load} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container-fluid')}>
        {/* Tiêu đề */}
        <div className={cx('hero')}>
          <div className={cx('avatar')}>
            <i className="fa-solid fa-user"></i>
          </div>
          <div>
            <h1 className={cx('username')}>{username || 'Người dùng'}</h1>
            <p className={cx('userId')}>ID: {userId}</p>
          </div>
        </div>

        {/* Thống kê */}
        <div className={cx('statsGrid')}>
          {STAT_CONFIG.map((s) => (
            <div key={s.key} className={cx('statCard')} style={{ '--accent': s.color }}>
              <span className={cx('statIcon')}>{s.icon}</span>
              <div>
                <div className={cx('statValue')}>{data[s.key] ?? 0}</div>
                <div className={cx('statLabel')}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={cx('sections')}>
          {/* Recent follows */}
          {data.recentFollows?.length > 0 && (
            <section className={cx('section')}>
              <div className={cx('sectionHeader')}>
                <h2 className={cx('sectionTitle')}>🔖 Truyện đang theo dõi</h2>
                <Link to={paths.library} className={cx('viewAll')}>
                  Xem tất cả
                </Link>
              </div>
              <div className={cx('scrollRow')}>
                {data.recentFollows.map((f) => (
                  <Link to={`${paths.mangaDetail}?slug=${f.mangaPath}`} key={f.id} className={cx('thumbCard')}>
                    <img
                      src={f.thumbnailUrl || ''}
                      alt={f.mangaName}
                      className={cx('thumbImg')}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120x170?text=?';
                      }}
                    />
                    <div className={cx('thumbTitle')}>{f.mangaName}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent reading history */}
          {data.recentReadingHistory?.length > 0 && (
            <section className={cx('section')}>
              <div className={cx('sectionHeader')}>
                <h2 className={cx('sectionTitle')}>🕓 Lịch sử đọc gần đây</h2>
                <Link to={paths.library} className={cx('viewAll')}>
                  Xem tất cả
                </Link>
              </div>
              <div className={cx('historyList')}>
                {data.recentReadingHistory.map((item, idx) => (
                  <Link to={`${paths.mangaDetail}?slug=${item.mangaPath}`} key={idx} className={cx('historyItem')}>
                    <img
                      src={item.thumbnailUrl || ''}
                      alt={item.mangaName}
                      className={cx('historyImg')}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x80?text=?';
                      }}
                    />
                    <div className={cx('historyInfo')}>
                      <div className={cx('historyName')}>{item.mangaName}</div>
                      {item.chapterName && <div className={cx('historyChapter')}>Chương: {item.chapterName}</div>}
                      <div className={cx('historyTime')}>{timeAgo(item.readAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent comments */}
          {data.recentComments?.length > 0 && (
            <section className={cx('section')}>
              <div className={cx('sectionHeader')}>
                <h2 className={cx('sectionTitle')}>💬 Bình luận gần đây</h2>
              </div>
              <div className={cx('commentList')}>
                {data.recentComments.map((c) => (
                  <div key={c.id} className={cx('commentItem')}>
                    <div className={cx('commentMeta')}>
                      <span className={cx('commentManga')}>{c.mangaPath}</span>
                      {c.chapterName && <span className={cx('commentChapter')}>• {c.chapterName}</span>}
                      <span className={cx('commentTime')}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <div className={cx('commentContent')}>{c.content}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
