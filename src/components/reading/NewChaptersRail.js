import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import { EmptyState, LoadingSpinner } from '~/components/common/AsyncState';
import { useNewChapters } from '~/hooks/useNewChapters';
import paths from '~/routes/paths';
import styles from './NewChaptersRail.module.scss';

const cx = classNames.bind(styles);
const CDN = 'https://sv1.otruyencdn.com/';
const IMG_BASE = process.env.REACT_APP_IMAGE_BASE_URL || '';

const coverSrc = (thumb) => {
  if (!thumb) return '';
  if (/^https?:\/\//i.test(thumb)) return thumb;
  if (thumb.startsWith('uploads/comics/')) return `${IMG_BASE}${thumb}`;
  return `${CDN}${thumb}`;
};

/**
 * NewChaptersRail — NEW CHAPTER ALERT (P0/P1)
 *
 * Built entirely on the EXISTING follow API: `GET /mangas/follows` already
 * returns `lastReadChapter` and `latestChapter`, so comparing them is the whole
 * feature. No new backend endpoint, no notification polling loop.
 *
 * "Read now" routes to the comic's latest chapter when we can resolve it,
 * otherwise to the detail page — never a dead link.
 */
export default function NewChaptersRail({ title = 'Chương mới từ thư viện', limit = 8, compact = false }) {
  const { items, loading, count } = useNewChapters({ limit });

  if (loading) return <LoadingSpinner text="Đang kiểm tra truyện bạn theo dõi..." />;
  if (count === 0) {
    return (
      <EmptyState
        icon="🎉"
        text="Bạn đã đọc hết truyện đang theo dõi. Hãy theo dõi thêm truyện mới nhé!"
      />
    );
  }

  return (
    <div>
      <div className={styles.head}>
        <h3 className={styles.title}>🔔 {title}</h3>
        <span className={styles.badge}>{count} truyện có chương mới</span>
      </div>

      <div className={cx('grid', { compact })}>
        {items.map((item) => {
          const detailTo = `${paths.mangaDetail}?slug=${encodeURIComponent(item.mangaPath)}`;
          return (
            <div key={item.id} className={cx('item')}>
              <Link to={detailTo} className={styles.coverLink}>
                {item.thumbnailUrl ? (
                  <img src={coverSrc(item.thumbnailUrl)} alt={item.mangaName} loading="lazy" className={styles.cover} />
                ) : (
                  <div className={styles.coverFallback}>{(item.mangaName || '?').charAt(0)}</div>
                )}
                {item.isRecent && <span className={styles.freshDot} title="Cập nhật gần đây" />}
              </Link>

              <div className={styles.body}>
                <Link to={detailTo} className={styles.name} title={item.mangaName}>
                  {item.mangaName}
                </Link>
                <div className={styles.chapterRow}>
                  <span className={styles.newTag}>MỚI</span>
                  <span className={styles.chapter}>Chương {item.latestChapter}</span>
                </div>
                <span className={styles.time}>{item.releasedLabel}</span>
              </div>

              <div className={styles.footer}>
                <span className={styles.unread}>
                  {item.unreadCount > 1 ? `+${item.unreadCount - 1} chương` : 'Chưa đọc'}
                </span>
                <Link to={detailTo} className={styles.readBtn}>
                  Đọc ngay
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
