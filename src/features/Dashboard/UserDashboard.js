import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './UserDashboard.module.scss';
import { useUser } from '~/providers/UserContext';
import { getDashboard } from '~/services/dashboardService';
import { getCollectionCount } from '~/services/collectionService';
import { getBookmarkCount } from '~/services/bookmarkService';
import { getReadingGoalProgress, getReadingStreak, getReadingGoal, updateReadingGoal, getReadingCalendar } from '~/services/readingAnalyticsService';
import { LoadingSpinner, EmptyState, ErrorState } from '~/components/common/AsyncState';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

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
  { key: 'totalCollections', label: 'Bộ sưu tập', icon: '🗂️', color: '#06b6d4' },
  { key: 'totalBookmarks', label: 'Đánh dấu chương', icon: '📌', color: '#ec4899' },
  { key: 'readingStreak', label: 'Chuỗi đọc', icon: '🔥', color: '#f97316' },
  { key: 'goalProgressPercent', label: 'Tiến độ mục tiêu', icon: '🎯', color: '#22c55e' },
];

export default function UserDashboard() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const { userId, username } = useUser();
  const [data, setData] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, collectionCountRes, bookmarkCountRes, goalProgressRes, streakRes, goalRes, calendarRes] = await Promise.all([
        getDashboard({ userId }),
        getCollectionCount({ userId }).catch(() => null),
        getBookmarkCount({ userId }).catch(() => null),
        getReadingGoalProgress({ userId }).catch(() => null),
        getReadingStreak({ userId }).catch(() => null),
        getReadingGoal({ userId }).catch(() => null),
        getReadingCalendar({ userId, days: 7 }).catch(() => null),
      ]);

      const dashboardData = dashboardRes?.result || dashboardRes || {};
      const collectionRaw = collectionCountRes?.result;
      const bookmarkRaw = bookmarkCountRes?.result;
      const goalRaw = goalProgressRes?.result || {};
      const streakRaw = streakRes?.result || {};
      const goalConfigRaw = goalRes?.result || {};
      const calendarRaw = calendarRes?.result || [];

      const totalCollections = typeof collectionRaw === 'number' ? collectionRaw : (collectionRaw?.count ?? collectionRaw?.total ?? 0);
      const totalBookmarks = typeof bookmarkRaw === 'number' ? bookmarkRaw : (bookmarkRaw?.count ?? bookmarkRaw?.total ?? 0);
      const readingStreak = streakRaw?.currentStreak ?? streakRaw?.streak ?? 0;
      const goalProgressPercent = Math.round(goalRaw?.progressPercent ?? goalRaw?.percent ?? 0);

      setData({
        ...dashboardData,
        totalCollections,
        totalBookmarks,
        readingStreak,
        goalProgressPercent,
        goalReadToday: goalRaw?.readToday ?? goalRaw?.todayRead ?? 0,
        goalTarget: goalRaw?.target ?? goalRaw?.goal ?? goalConfigRaw?.target ?? goalConfigRaw?.goal ?? 0,
        calendar: Array.isArray(calendarRaw) ? calendarRaw : [],
      });
      setGoalInput(String(goalRaw?.target ?? goalRaw?.goal ?? goalConfigRaw?.target ?? goalConfigRaw?.goal ?? ''));
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

  const handleUpdateGoal = async () => {
    const goal = Number(goalInput);
    if (!userId || !goal || goal < 1 || savingGoal) return;
    setSavingGoal(true);
    try {
      await updateReadingGoal({ userId, goal });
      setData((prev) => ({ ...prev, goalTarget: goal }));
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSavingGoal(false);
    }
  };

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
                <div className={cx('statValue')}>{s.key === 'goalProgressPercent' ? `${data[s.key] ?? 0}%` : (data[s.key] ?? 0)}</div>
                <div className={cx('statLabel')}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {(data.goalTarget > 0 || data.readingStreak > 0) && (
          <section className={cx('section')}>
            <div className={cx('sectionHeader')}>
              <h2 className={cx('sectionTitle')}>📈 Đọc truyện hôm nay</h2>
            </div>
            <div className={cx('goalCard')}>
              <div className={cx('goalText')}>
                Đã đọc hôm nay: <strong>{data.goalReadToday ?? 0}</strong>
                {data.goalTarget > 0 ? ` / ${data.goalTarget}` : ''}
              </div>
              <div className={cx('goalText')}>
                Chuỗi ngày đọc: <strong>{data.readingStreak ?? 0}</strong> ngày
              </div>
            </div>

            <div className={cx('goalUpdateRow')}>
              <input type="number" min="1" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className={cx('goalInput')} placeholder="Mục tiêu đọc/ngày" />
              <button className={cx('goalBtn')} onClick={handleUpdateGoal} disabled={savingGoal || !goalInput}>
                {savingGoal ? 'Đang lưu...' : 'Cập nhật mục tiêu'}
              </button>
            </div>

            {data.calendar?.length > 0 && (
              <div className={cx('calendarRow')}>
                {data.calendar.map((day, idx) => {
                  const count = day.count ?? day.readCount ?? 0;
                  const label = day.date || day.day || `D${idx + 1}`;
                  return (
                    <div key={idx} className={cx('calendarCell', { active: count > 0 })} title={`${label}: ${count}`}>
                      <span>{label}</span>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

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
                      src={f.thumbnailUrl ? `${IMG_BASE_URL}${f.thumbnailUrl}` : ''}
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
                      <span className={cx('commentManga')}>{c.mangaName}</span>
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
