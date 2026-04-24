import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingSpinner } from '~/components/common/AsyncState';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import { getBookmarkCount } from '~/services/bookmarkService';
import { getCollectionCount } from '~/services/collectionService';
import { getDashboard } from '~/services/dashboardService';
import { getReadingCalendar, getReadingGoal, getReadingGoalProgress, getReadingStreak, updateReadingGoal } from '~/services/readingAnalyticsService';
import styles from './UserDashboard.module.scss';
import { Avatar } from '@mui/material';

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
  { key: 'totalFollows', label: 'Đang theo dõi', icon: '🔖', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'totalReadingHistory', label: 'Đã đọc', icon: '📖', color: '#10b981', bg: '#ecfdf5' },
  { key: 'totalComments', label: 'Bình luận', icon: '💬', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'totalRatings', label: 'Đánh giá', icon: '⭐', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'unreadNotifications', label: 'Thông báo', icon: '🔔', color: '#ef4444', bg: '#fef2f2' },
  { key: 'totalCollections', label: 'Bộ sưu tập', icon: '🗂️', color: '#06b6d4', bg: '#ecfeff' },
  { key: 'totalBookmarks', label: 'Đánh dấu', icon: '📌', color: '#ec4899', bg: '#fdf2f8' },
  { key: 'readingStreak', label: 'Chuỗi đọc', icon: '🔥', color: '#f97316', bg: '#fff7ed' },
];

export default function UserDashboard() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const { userId, username, userData } = useUser();
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

  if (!userId) return <div className={cx('wrapper')}><div className={cx('container-fluid')}><EmptyState icon="🔒" text="Vui lòng đăng nhập." /></div></div>;
  if (loading) return <div className={cx('wrapper')}><div className={cx('container-fluid')}><LoadingSpinner /></div></div>;
  if (error) return <div className={cx('wrapper')}><div className={cx('container-fluid')}><ErrorState text={error} onRetry={load} /></div></div>;
  if (!data) return null;

  const handleUpdateGoal = async () => {
    const goal = Number(goalInput);
    if (!userId || !goal || goal < 1 || savingGoal) return;
    setSavingGoal(true);
    try {
      await updateReadingGoal({ userId, goal });
      setData((prev) => ({ ...prev, goalTarget: goal }));
    } catch {} finally {
      setSavingGoal(false);
    }
  };

  const goalPercent = data.goalTarget > 0 ? Math.min(100, Math.round((data.goalReadToday / data.goalTarget) * 100)) : 0;

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container-fluid')}>
        
        {/* PROFILE & READING GOAL CARD */}
        <div className={cx('profileGoalCard')}>
          <div className={cx('profileSide')}>
            <Avatar className={cx('avatar')} src={userData?.urlImage || undefined} />
            <div className={cx('info')}>
              <h1 className={cx('username')}>{userData.name || 'Người dùng'}</h1>
              <p className={cx('userId')}>ID: {userId}</p>
            </div>
          </div>

          <div className={cx('goalSide')}>
            <div className={cx('goalHeader')}>
              <div className={cx('goalTitle')}>📈 Mục tiêu hôm nay</div>
              <div className={cx('goalStats')}>
                <div className={cx('bigNum')}>{data.goalReadToday ?? 0}</div>
                <div className={cx('subText')}>/ {data.goalTarget || 0} chương</div>
              </div>
            </div>

            <div className={cx('progressBar')}>
              <div className={cx('progressFill')} style={{ width: `${goalPercent}%` }}></div>
            </div>

            <div className={cx('goalActions')}>
              <input type="number" min="1" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="Mục tiêu" />
              <button onClick={handleUpdateGoal} disabled={savingGoal || !goalInput}>
                {savingGoal ? '...' : 'Lưu'}
              </button>
              <div className={cx('streakBadge')}>
                🔥 {data.readingStreak ?? 0} ngày
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className={cx('statsGrid')}>
          {STAT_CONFIG.map((s) => (
            <div key={s.key} className={cx('statCard')} style={{ '--accent': s.color, '--accent-bg': s.bg }}>
              <span className={cx('statIcon')}>{s.icon}</span>
              <div className={cx('statValue')}>{data[s.key] ?? 0}</div>
              <div className={cx('statLabel')}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={cx('sections')}>
          
          {/* Lịch sử đọc (Full Width) */}
          {data.recentReadingHistory?.length > 0 && (
            <section className={cx('section', 'fullWidth')}>
              <div className={cx('sectionHeader')}>
                <h2 className={cx('sectionTitle')}>🕓 Lịch sử đọc gần đây</h2>
                <Link to={paths.library} className={cx('viewAll')}>Xem tất cả</Link>
              </div>
              
              {data.calendar?.length > 0 && (
                <div className={cx('calendarRow')}>
                  {data.calendar.map((day, idx) => {
                    const count = day.count ?? day.readCount ?? 0;
                    const label = day.date ? new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' }) : `D${idx + 1}`;
                    return (
                      <div key={idx} className={cx('calendarCell', { active: count > 0 })}>
                        <span>{label}</span>
                        <strong>{count}</strong>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className={cx('historyList')}>
                {data.recentReadingHistory.slice(0, 5).map((item, idx) => (
                  <Link to={`${paths.mangaDetail}?slug=${item.mangaPath}`} key={idx} className={cx('historyItem')}>
                    <img loading="lazy" src={item.thumbnailUrl ? `https://sv1.otruyencdn.com/${item.thumbnailUrl}` : ''} alt={item.mangaName} className={cx('historyImg')} />
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

          {/* Đang theo dõi */}
          {data.recentFollows?.length > 0 && (
            <section className={cx('section')}>
              <div className={cx('sectionHeader')}>
                <h2 className={cx('sectionTitle')}>🔖 Đang theo dõi</h2>
                <Link to={paths.library} className={cx('viewAll')}>Xem tất cả</Link>
              </div>
              <div className={cx('scrollRow')}>
                {data.recentFollows.map((f) => (
                  <Link to={`${paths.mangaDetail}?slug=${f.mangaPath}`} key={f.id} className={cx('thumbCard')}>
                    <img src={f.thumbnailUrl ? `${IMG_BASE_URL}${f.thumbnailUrl}` : ''} alt={f.mangaName} className={cx('thumbImg')} />
                    <div className={cx('thumbTitle')}>{f.mangaName}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bình luận */}
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
                      {c.chapterName && <span className={cx('commentChapter')}>• Chap {c.chapterName}</span>}
                      <span className={cx('commentTime')}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <div className={cx('commentContent')}>"{c.content}"</div>
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