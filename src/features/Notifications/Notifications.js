import classNames from 'classnames/bind';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState, ErrorState, LoadingSpinner } from '~/components/common/AsyncState';
import { connectStomp, WS_TOPICS, subscribe as wsSubscribe } from '~/lib/realtime';
import { unwrapPage } from '~/lib/httpRequest';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import { deleteAllNotifications, deleteNotification, getNotifications, markAllRead, markRead } from '~/services/notificationService';
import styles from './Notifications.module.scss';

const cx = classNames.bind(styles);

// Đổi Emoji sang Icon class để CSS styling đồng bộ và đẹp hơn
const TYPE_CONFIG = {
  FOLLOW_MANGA: { icon: 'fa-solid fa-user-plus', label: 'Follow' },
  COMMENT_REPLY: { icon: 'fa-solid fa-comment-dots', label: 'Reply' },
  LIKE: { icon: 'fa-solid fa-heart', label: 'Like' },
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
      // Rule 2: `/notifications` is 1-based — page 1 is the FIRST page.
      const pageNumber = reset ? 1 : page;
      try {
        const { data } = await getNotifications({
          userId,
          // `isRead` is 0/1 on the wire, not a boolean.
          isRead: filter === 'unread' ? 0 : undefined,
          pageNumber,
          pageSize: PAGE_SIZE,
        });

        // The response is a page object, NOT a bare array.
        const { content, hasNext } = unwrapPage({ data });

        setItems((prev) => (reset ? content : [...prev, ...content]));
        // `hasNext` comes from the server — never infer it from length.
        setHasMore(hasNext);
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

  // Rule 6: subscribe only after sign-in, and ALWAYS unsubscribe on unmount.
  useEffect(() => {
    if (!userId) return undefined;

    connectStomp();
    const subscription = wsSubscribe(WS_TOPICS.notifications(userId), (msg) => {
      if (msg?.type === 'READ-ALL') {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
        setUnreadCount(0);
        return;
      }
      setUnreadCount((c) => c + 1);
      // `isRead` arrives as 0/1 — normalise before it hits the list.
      setItems((prev) => [{ ...msg, isRead: Number(msg.isRead) === 1 ? 1 : 0 }, ...prev]);
    });

    return () => subscription?.unsubscribe();
  }, [userId, setUnreadCount]);

  // `isRead` is 0/1 — `!n.isRead` is always false for the number 0.
  const isUnread = (notif) => Number(notif?.isRead) === 0;

  const handleMarkRead = async (notif) => {
    if (!isUnread(notif)) return;
    // Optimistic: flip to read immediately, roll back if the write fails.
    setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: 1 } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markRead(notif.id);
    } catch {
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: 0 } : n)));
      setUnreadCount((c) => c + 1);
    }
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
    setUnreadCount(0);
    try {
      await markAllRead();
    } catch {
      load(true);
    }
  };

  const handleDeleteOne = async (notifId) => {
    const target = items.find((n) => n.id === notifId);
    setItems((prev) => prev.filter((n) => n.id !== notifId));
    if (target && isUnread(target)) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    try {
      await deleteNotification({ notificationId: notifId });
    } catch {
      load(true);
    }
  };

  const handleDeleteAll = async () => {
    const prev = items;
    setItems([]);
    setUnreadCount(0);
    try {
      await deleteAllNotifications();
    } catch {
      setItems(prev);
      load(true);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
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
          <div className={cx('headerActions')}>
            {items.some((n) => isUnread(n)) && (
              <button className={cx('actionBtn', 'markRead')} onClick={handleMarkAllRead}>
                <i className="fa-regular fa-circle-check"></i> Đã đọc tất cả
              </button>
            )}
            {items.length > 0 && (
              <button className={cx('actionBtn', 'deleteAll')} onClick={handleDeleteAll}>
                <i className="fa-regular fa-trash-can"></i> Xóa tất cả
              </button>
            )}
          </div>
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

        {!error && items.length === 0 && !loading && (
          <EmptyState icon="🔔" text={filter === 'unread' ? 'Bạn không có thông báo chưa đọc.' : 'Chưa có thông báo nào.'} />
        )}

        <div className={cx('list')}>
          {items.map((notif) => {
            const typeConf = TYPE_CONFIG[notif.type] || TYPE_CONFIG.DEFAULT;
            return (
              <div key={notif.id} className={cx('item', { unread: isUnread(notif) })} onClick={() => handleMarkRead(notif)}>
                <div className={cx('notifIcon', notif.type || 'DEFAULT')}>
                  <i className={typeConf?.icon}></i>
                </div>
                <div className={cx('itemBody')}>
                  <div className={cx('itemTitle')}>{notif.title}</div>
                  <div className={cx('itemContent')}>{notif.content}</div>
                  {notif.mangaPath && (
                    <Link to={`${paths.mangaDetail}?slug=${notif.mangaPath}`} className={cx('itemLink')} onClick={(e) => e.stopPropagation()}>
                      <i className="fa-solid fa-arrow-right-long"></i> Xem truyện
                    </Link>
                  )}
                </div>
                <div className={cx('itemMeta')}>
                  <span className={cx('time')}>{timeAgo(notif.createdAt)}</span>
                  {isUnread(notif) && <span className={cx('dot')} />}
                  <button
                    className={cx('deleteOneBtn')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOne(notif.id);
                    }}
                    title="Xóa thông báo"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            );
          })}
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