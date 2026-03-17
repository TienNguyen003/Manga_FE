import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './MangaCard.module.scss';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

export default function MangaCard({ manga, badge, rank }) {
  if (!manga) return null;
  const { name, slug, thumb_url, status, score } = manga;

  return (
    <Link to={`${paths.mangaDetail}?slug=${slug}`} className={cx('card')}>
      {rank && <span className={cx('rank')}>#{rank}</span>}
      {badge && <span className={cx('badge')}>{badge}</span>}
      {status && <span className={cx('status', status.toLowerCase() === 'ongoing' ? 'ongoing' : 'completed')}>{status}</span>}
      <img src={thumb_url ? `${IMG_BASE_URL}${thumb_url}` : ''} alt={name} loading="lazy" className={cx('img')} />
      <div className={cx('info')}>
        {score > 0 && <div className={cx('score')}>⭐ {score}</div>}
        <div className={cx('title')}>{name}</div>
      </div>
    </Link>
  );
}
