import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import ContentBadge from '~/components/common/ContentBadge';
import { ACCESS_PREMIUM, summariseComicAccess } from '~/services/contentAccessService';
import styles from './MangaCard.module.scss';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

/**
 * Shared comic card.
 *
 * The access badge is opt-in via `accessType` so existing callers (Admin team
 * projects) are unaffected, but every surface that has chapter data can now
 * mark a comic as PREMIUM without redesigning the card.
 */
export default function MangaCard({ manga, badge, rank, accessType, price }) {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  if (!manga) return null;

  const name = manga.mangaName || manga.name || manga.title || '';
  const slug = manga.mangaPath || manga.slug || '';
  const thumb = manga.thumbnailUrl || manga.thumb_url || manga.cover || '';
  const score = manga.averageRating ?? manga.score ?? 0;
  const status = manga.status || '';

  // Derive the badge from chapter data when the caller did not pass one.
  const resolvedAccess =
    accessType ??
    (Array.isArray(manga.chapters?.[0]?.server_data)
      ? summariseComicAccess(manga.chapters[0].server_data).premiumCount > 0
        ? ACCESS_PREMIUM
        : null
      : manga.isPremium
        ? ACCESS_PREMIUM
        : null);

  return (
    <Link to={`${paths.mangaDetail}?slug=${slug}`} className={cx('card', 'modernCard')}>
      <div className={cx('imgWrap')}>
        <img src={thumb ? `${IMG_BASE_URL}${thumb}` : ''} alt={name} loading="lazy" className={cx('cover')} />
        {status && <span className={cx('statusBadge', status.toLowerCase() === 'ongoing' ? 'ongoing' : 'completed')}>{status}</span>}
        {resolvedAccess ? (
          <span className={cx('accessBadge')}>
            <ContentBadge type={resolvedAccess} price={price ?? 0} size="sm" showPrice={false} />
          </span>
        ) : null}
        {score > 0 && <span className={cx('scoreBadge')}>⭐ {score}</span>}
      </div>
      <div className={cx('titleOverlay', 'modernOverlay')}>
        <div className={cx('title')}>{name}</div>
      </div>
    </Link>
  );
}
