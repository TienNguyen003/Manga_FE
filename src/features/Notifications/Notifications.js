import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './Notifications.module.scss';
import { useUser } from '~/providers/UserContext';
import { getNotifications, getUnreadCount, markRead, markAllRead } from '~/services/notificationService';
import { LoadingSpinner, EmptyState, ErrorState } from '~/components/common/AsyncState';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

const TYPE_ICON = {
  FOLLOW: '🔖',
  REPLY: '💬',
  LIKE: '❤️',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function Notifications() {
  const { userId, setUnreadCount } = useUser();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const load = useCallback(
    async (reset = false) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      const pageNum = reset ? 1 : page;
      try {
        const res = await getNotifications({
          userId,
          isRead: filter === 'unread' ? false : undefined,
          pageNumber: pageNum,
          pageSize: PAGE_SIZE,
        });
        const list = res?.result || [];
        setItems((prev) => (reset || pageNum === 1 ? list : [...prev, ...list]));
        setHasMore(list.length === PAGE_SIZE);
        if (reset) setPage(1);
      } catch {
        setError('Không thể tải thông báo. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    [userId, filter, page],
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter]);

  const handleMarkRead = async (notif) => {
    if (notif.isRead) return;
    // Optimistic update
    setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markRead(userId, notif.id);
    } catch {
      // Revert
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: false } : n)));
      setUnreadCount((c) => c + 1);
    }
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllRead(userId);
    } catch {
      load(true);
    }
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
    load(false);
  };

  if (!userId) {
    return (
      <div className={cx('wrapper')}>
        <div className={cx('container-fluid')}>
          <EmptyState icon="🔒" text="Vui lòng đăng nhập để xem thông báo." />
        </div>
      </div>
    );
  }

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container-fluid')}>
        <div className={cx('header')}>
          <h1 className={cx('pageTitle')}>Thông báo</h1>
          {items.some((n) => !n.isRead) && (
            <button className={cx('markAllBtn')} onClick={handleMarkAllRead}>
              <i className="fa-regular fa-circle-check"></i> Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className={cx('filters')}>
          <button className={cx('filterBtn', { active: filter === 'all' })} onClick={() => setFilter('all')}>
            Tất cả
          </button>
          <button className={cx('filterBtn', { active: filter === 'unread' })} onClick={() => setFilter('unread')}>
            Chưa đọc
          </button>
        </div>

        {error && <ErrorState text={error} onRetry={() => load(true)} />}

        {!error && items.length === 0 && !loading && <EmptyState icon="🔔" text={filter === 'unread' ? 'Bạn không có thông báo chưa đọc.' : 'Chưa có thông báo nào.'} />}

        <div className={cx('list')}>
          {items.map((notif) => (
            <div key={notif.id} className={cx('item', { unread: !notif.isRead })} onClick={() => handleMarkRead(notif)}>
              <div className={cx('itemIcon')}>{TYPE_ICON[notif.type] || '🔔'}</div>
              <div className={cx('itemBody')}>
                <div className={cx('itemTitle')}>{notif.title}</div>
                <div className={cx('itemContent')}>{notif.content}</div>
                {notif.mangaPath && (
                  <Link to={`${paths.mangaDetail}?slug=${notif.mangaPath}`} className={cx('itemLink')} onClick={(e) => e.stopPropagation()}>
                    Xem truyện
                  </Link>
                )}
              </div>
              <div className={cx('itemMeta')}>
                <span className={cx('time')}>{timeAgo(notif.createdAt)}</span>
                {!notif.isRead && <span className={cx('dot')} />}
              </div>
            </div>
          ))}
        </div>

        {loading && <LoadingSpinner text="Đang tải thêm..." />}

        {!loading && hasMore && items.length > 0 && (
          <div className={cx('loadMoreWrap')}>
            <button className={cx('loadMoreBtn')} onClick={handleLoadMore}>
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
