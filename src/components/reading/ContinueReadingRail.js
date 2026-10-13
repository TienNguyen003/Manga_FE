import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import { EmptyState, LoadingSpinner } from '~/components/common/AsyncState';
import { useContinueReading } from '~/hooks/useContinueReading';
import { encodeChapterApiData } from '~/services/shareService';
import { timeAgo } from '~/lib/date';
import paths from '~/routes/paths';
import styles from './ContinueReadingRail.module.scss';

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
 * ContinueReadingRail — SMART CONTINUE READING (P0)
 *
 * Replaces the old Home rail that (a) showed a `Math.random()` progress bar and
 * (b) linked to the detail page, losing the reader's place.
 *
 * Each card now shows: comic · chapter · page x/y · real percent · time ago,
 * and its primary action deep-links straight into the reader at the saved page.
 * `api`/`local` provenance is exposed via `title` so it is debuggable, and a
 * card without a resumable page still links to the comic rather than dead-ending.
 */
export default function ContinueReadingRail({ title = 'Tiếp tục đọc', limit = 8, showHeader = true }) {
  const { items, loading, hasItems } = useContinueReading({ limit });

  const withLinks = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        resumeTo:
          item.chapterApiData && item.mangaPath
            ? `${paths.chapterDetail}?slug=${encodeURIComponent(item.mangaPath)}&id=${encodeURIComponent(
                encodeChapterApiData(item.chapterApiData),
              )}&page=${item.currentPage || 1}`
            : null,
        detailTo: `${paths.mangaDetail}?slug=${encodeURIComponent(item.mangaPath || '')}`,
      })),
    [items],
  );

  if (loading && !hasItems) {
    return (
      <div className={cx('stack')}>
        <LoadingSpinner text="Đang tải truyện bạn đang đọc..." />
      </div>
    );
  }

  if (!hasItems) {
    return (
      <EmptyState
        icon="📖"
        text="Bạn chưa đọc gì. Mở một bộ truyện bất kỳ — chúng tôi sẽ nhớ chỗ bạn dừng lại."
      />
    );
  }

  return (
    <div>
      {showHeader && (
        <div className={styles.header}>
          <h2 className={styles.title}>📖 {title}</h2>
          <Link to={paths.library} className={styles.viewAll}>
            Thư viện →
          </Link>
        </div>
      )}

      <div className={cx('stack')}>
        {withLinks.map((item, index) => {
          const hasPage = item.totalPages > 0 && item.currentPage > 0;
          const percent = item.percent || 0;
          return (
            <div key={`${item.mangaPath}-${index}`} className={cx('item')}>
              <Link to={item.detailTo} aria-hidden="true" tabIndex={-1}>
                {item.thumbnailUrl ? (
                  <img className={cx('cover')} src={coverSrc(item.thumbnailUrl)} alt={item.mangaName} loading="lazy" />
                ) : (
                  <div className={cx('coverFallback')}>{(item.mangaName || '?').charAt(0)}</div>
                )}
              </Link>

              <div className={cx('body')}>
                <Link to={item.detailTo} className={cx('title')}>
                  {item.mangaName || 'Truyện'}
                </Link>

                <div className={cx('row')}>
                  <span className={styles.chapter}>Chương {item.chapterName || '?'}</span>
                  {hasPage && <span className={styles.pages}>Trang {item.currentPage} / {item.totalPages}</span>}
                  {item.completed && <span className={styles.done}>✓ Đã đọc xong</span>}
                </div>

                <div className={cx('progressTrack')} title={`${percent}%`}>
                  <div className={cx('progressFill')} style={{ width: `${Math.max(3, percent)}%` }} />
                </div>

                <div className={cx('footer')}>
                  <span className={styles.time}>
                    {item.readAt ? timeAgo(item.readAt) : 'Chưa ghi nhận'} · {percent}%
                  </span>
                  <span className={styles.actions}>
                    {item.resumeTo ? (
                      <Link to={item.resumeTo} className={cx('resumeBtn')}>
                        Tiếp tục
                      </Link>
                    ) : (
                      <Link to={item.detailTo} className={cx('detailBtn')}>
                        Mở truyện
                      </Link>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
