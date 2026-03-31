import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Link, useLocation } from 'react-router-dom';
import { Pagination, Stack, Skeleton } from '@mui/material';
import { SearchOffRounded, StarRounded, AutoAwesome } from '@mui/icons-material';

import styles from './Category.module.scss';
import { getMangasByCategory, searchMangas } from '~/services/mangaService';
import { ErrorState } from '~/components/common/AsyncState';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

export default function CategorySection() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slug = queryParams.get('slug') || queryParams.get('type');
  const search = queryParams.get('search');

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const [mangas, setManga] = useState(null); // Để null để check lúc đầu
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setActivePage(1);
  }, [slug, search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getManga();
  }, [activePage, slug, search]);

  const getManga = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (slug) res = await getMangasByCategory({ path: slug, page: activePage });
      else if (search) res = await searchMangas({ keyword: search, page: activePage });
      setManga(res);
    } catch {
      setError('Không thể tải danh sách truyện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const pageHeading = search ? `Kết quả cho: "${search}"` : slug ? `Thể loại: ${slug.replace(/-/g, ' ')}` : 'Khám phá truyện';

  return (
    <div className={cx('category-container', 'container-fluid')}>
      <div className={cx('header-section')}>
        <h2 className={cx('title')}>
          <AutoAwesome className={cx('icon-title')} />
          {pageHeading}
        </h2>
        <div className={cx('divider')}></div>
      </div>

      {error && !loading && <ErrorState text={error} onRetry={getManga} />}

      <div className={cx('content-grid')}>
        {loading
          ? // Skeleton Loading - Hiển thị 10 card giả
            Array.from(new Array(10)).map((_, i) => (
              <div key={i} className={cx('manga-card-skeleton')}>
                <Skeleton variant="rounded" width="100%" height="300px" sx={{ borderRadius: '16px' }} />
                <Skeleton variant="text" sx={{ fontSize: '1.5rem', mt: 1 }} width="80%" />
                <Skeleton variant="text" width="40%" />
              </div>
            ))
          : mangas?.result?.length > 0
            ? mangas.result.map((manga, index) => (
                <Link key={index} to={`${paths.mangaDetail}?slug=${manga.slug}`} className={cx('card-link')}>
                  <div className={cx('manga-card')}>
                    <div className={cx('image-wrapper')}>
                      <div className={cx('badge', manga.status?.toLowerCase())}>{manga.status}</div>
                      <img loading="lazy" src={`${IMG_BASE_URL}${manga.thumb_url}`} alt={manga.name} className={cx('img')} />
                      <div className={cx('overlay')}>
                        <div className={cx('view-btn')}>Xem ngay</div>
                      </div>
                    </div>
                    <div className={cx('info')}>
                      <div className={cx('manga-name')}>{manga.name}</div>
                      <div className={cx('meta')}>
                        {manga.chaptersLatest && manga.chaptersLatest.length > 0 ? (
                          <span className={cx('latest-chapter')}>Chương {manga.chaptersLatest[0].chapter_name}</span>
                        ) : (
                          <span className={cx('status-text')}>Đang cập nhật</span>
                        )}

                        <span className={cx('update-time')}>{new Date(manga.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            : !loading && (
                <div className={cx('not-found')}>
                  <SearchOffRounded className={cx('empty-icon')} />
                  <p>Rất tiếc, không tìm thấy truyện nào!</p>
                </div>
              )}
      </div>

      {!loading && Number(mangas?.page?.totalItems) > Number(mangas?.page?.totalItemsPerPage) && (
        <Stack alignItems="center" sx={{ mt: 8, mb: 4 }}>
          <Pagination
            page={activePage}
            count={Math.ceil(mangas.page.totalItems / mangas.page.totalItemsPerPage)}
            color="primary"
            onChange={(e, v) => setActivePage(v)}
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 700,
                borderRadius: '12px',
                height: '45px',
                minWidth: '45px',
                fontSize: '1.5rem',
              },
              '& .Mui-selected': {
                backgroundColor: '#EA982B !important',
                boxShadow: '0 4px 12px rgba(234, 152, 43, 0.3)',
              },
              '& .MuiPaginationItem-icon': {
                fontSize: '2.4rem',
              },
            }}
          />
        </Stack>
      )}
    </div>
  );
}
