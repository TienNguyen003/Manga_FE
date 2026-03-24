import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import { getMangasByCategory, searchMangas } from '~/services/mangaService';
import { ErrorState } from '~/components/common/AsyncState';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

export default function CategorySection() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slug = queryParams.get('slug') || queryParams.get('type');
  const search = queryParams.get('search');

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const [mangas, setManga] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setActivePage(1);
  }, [slug, search]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    getManga();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, slug, search]);

  const getManga = async () => {
    setLoading(true);
    setError('');
    let res = [];
    try {
      if (slug) res = await getMangasByCategory({ path: slug, page: activePage });
      else if (search) res = await searchMangas({ keyword: search, page: activePage });
      setManga(res || []);
    } catch {
      setError('Không thể tải danh sách truyện. Vui lòng thử lại.');
      setManga([]);
    } finally {
      setLoading(false);
    }
  };

  const pageHeading = search ? `Kết quả tìm kiếm: ${search}` : slug ? `Danh mục: ${slug.charAt(0).toUpperCase() + slug.slice(1)}` : 'Khám phá truyện';

  return (
    <div className={cx('category')}>
      <div>
        <h2 className={cx('title')}>{pageHeading}</h2>
        {error && !loading && <ErrorState text={error} onRetry={getManga} />}
        <div className={cx('row')}>
          {!loading && !error && mangas.result && mangas.result.length > 0 ? (
            <div className={cx('mangaList')}>
              {mangas.result.map((manga, index) => (
                <div key={index}>
                  <Link to={`${paths.mangaDetail}?slug=${manga.slug}`}>
                    <div className={cx('card')}>
                      <div className={cx('badge', manga.status.toLowerCase())}>{manga.status}</div>
                      <img loading="lazy" src={`${IMG_BASE_URL}${manga.thumb_url}`} alt={manga.name} className={cx('img')} />
                      <div className={cx('info')}>
                        {manga.score > 0 && <div className={cx('score')}>⭐ Score {manga.score}</div>}
                        <div className={cx('mangaTitle')}>{manga.name}</div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : !loading && !error ? (
            <div className={cx('notFoundWrapper')}>
              <img src="https://img.icons8.com/?size=100&id=45967&format=png&color=ffffff" alt="No manga found" className={cx('notFoundImage')} />
              <p className={cx('notFoundMessage')}>Không tìm thấy truyện nào phù hợp.</p>
            </div>
          ) : null}
        </div>

        {!loading && !error && mangas?.result && mangas.result.length > 0 && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <Pagination
              page={activePage}
              count={Math.ceil(mangas.page.totalItems / mangas.page.totalItemsPerPage)}
              showFirstButton
              showLastButton
              onChange={(event, value) => {
                setActivePage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1.25rem',
                  color: '#b97a1a',
                  background: '#fff',
                  borderRadius: '50%',
                  border: '1.5px solid #f3e9de',
                  boxShadow: '0 2px 8px 0 rgba(60,40,20,0.06)',
                  minWidth: 40,
                  minHeight: 40,
                  margin: '0 4px',
                  fontWeight: 700,
                  transition: 'all 0.18s',
                },
                '& .Mui-selected': {
                  backgroundColor: '#EA982B !important',
                  color: '#fff !important',
                  border: 'none',
                  boxShadow: '0 4px 16px 0 rgba(234,152,43,0.13)',
                  fontWeight: 800,
                  transform: 'scale(1.08)',
                },
                '& .MuiPaginationItem-root:hover': {
                  background: '#fff7e0',
                  color: '#a86a1a',
                  borderColor: '#f7d9a8',
                },
              }}
            />
          </Stack>
        )}
      </div>
    </div>
  );
}
