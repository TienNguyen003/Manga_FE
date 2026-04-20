import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { Container, Typography, Stack, Skeleton, Box } from '@mui/material';
import { EmojiEventsRounded, TrendingUpRounded, LocalFireDepartmentRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import styles from './Rankings.module.scss';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

export default function Rankings() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMangasByCategory({ path: 'trending', page: 1 })
      .then((res) => {
        if (mounted) setMangas(res?.result || []);
      })
      .catch(() => {
        if (mounted) setMangas([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const top10 = useMemo(() => mangas.slice(0, 10), [mangas]);

  return (
    <main className={cx('rankingsPage', 'container-fluid')}>
      <Container maxWidth="md">
        <header className={cx('hero')}>
          <div className={cx('heroContent')}>
            <span className={cx('kicker')}>
              <LocalFireDepartmentRounded fontSize="small" /> Trending Now
            </span>
            <Typography variant="h1">Bảng Xếp Hạng Tuần</Typography>
            <Typography variant="body1">Khám phá những siêu phẩm đang thống trị cộng đồng tuần này.</Typography>
          </div>
        </header>

        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" className={cx('skeleton')} />
            ))}
          </Stack>
        ) : (
          <section className={cx('listWrap')}>
            {top10.map((item, idx) => {
              const rankClass = idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : '';
              return (
                <Link to={`${paths.mangaDetail}?slug=${item.slug}`} key={item.slug || idx} className={cx('rankItem', rankClass)}>
                  <div className={cx('rankIndicator')}>
                    <span className={cx('number')}>{idx + 1}</span>
                    {idx < 3 && <EmojiEventsRounded className={cx('medal')} />}
                  </div>

                  <img src={item.thumb_url ? `${IMG_BASE_URL}${item.thumb_url}` : ''} alt={item.name} className={cx('cover')} />

                  <div className={cx('meta')}>
                    <h3>{item.name}</h3>
                    <div className={cx('stats')}>
                      <span className={cx('status')}>{item.status || 'Ongoing'}</span>
                      <span className={cx('score')}>
                        <TrendingUpRounded fontSize="small" /> {item.score || '9.0'}
                      </span>
                    </div>
                  </div>

                  <div className={cx('action')}>
                    <ArrowForwardIosRounded />
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </Container>
    </main>
  );
}
