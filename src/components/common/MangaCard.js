import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './MangaCard.module.scss';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

export default function MangaCard({ manga, badge, rank }) {
  if (!manga) return null;

  // normalize data (hỗ trợ cả 2 kiểu)
  const name = manga.mangaName || manga.name || '';
  const slug = manga.mangaPath || manga.slug || '';
  const thumb = manga.thumbnailUrl || manga.thumb_url || '';
  const score = manga.averageRating ?? manga.score ?? 0;
  const status = manga.status || '';

  return (
    <Link to={`${paths.mangaDetail}?slug=${slug}`} className={cx('card', 'modernCard')}>
      <div className={cx('imgWrap')}>
        <img src={thumb ? `${IMG_BASE_URL}${thumb}` : ''} alt={name} loading="lazy" className={cx('cover')} />
        {status && <span className={cx('statusBadge', status.toLowerCase() === 'ongoing' ? 'ongoing' : 'completed')}>{status}</span>}
        {score > 0 && <span className={cx('scoreBadge')}>⭐ {score}</span>}
      </div>
      <div className={cx('titleOverlay', 'modernOverlay')}>
        <div className={cx('title')}>{name}</div>
      </div>
    </Link>
  );
}
