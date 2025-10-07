import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import { getMangasByCategory, searchMangas } from '~/services/mangaService';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

export default function CategorySection() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slug = queryParams.get('slug');
  const search = queryParams.get('search');

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const [mangas, setManga] = useState([]);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    getManga();
  }, [slug, search]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    getManga();
  }, [activePage]);

  const getManga = async () => {
    let res = [];
    if (slug) res = await getMangasByCategory({ path: slug, page: activePage });
    else if (search)
      res = await searchMangas({ keyword: search, page: activePage });
    setManga(res);
  };

  return (
    <div className={cx('category')}>
      <div className={cx('container-fluid')}>
        {slug && (<h2 className={cx('title')}>Đề xuất truyện tranh {slug.charAt(0).toUpperCase() + slug.slice(1)}</h2>)}
        {search && (<h2 className={cx('title')}>Tìm kiếm truyện tranh {search.charAt(0).toUpperCase() + search.slice(1)}</h2>)}
        <div className={cx('row')}>
          {mangas.result && mangas.result.length > 0 ? (
            mangas.result.map((manga, index) => (
              <div key={index} className={cx('pc-3 p-2')}>
                <Link to={`${paths.mangaDetail}?slug=${manga.slug}`}>
                  <div className={cx('card')}>
                    <div className={cx('badge', manga.status.toLowerCase())}>{manga.status}</div>
                    <img src={`${IMG_BASE_URL}${manga.thumb_url}`} alt={manga.name} loading="lazy" className={cx('img')} />
                    <div className={cx('info')}>
                      {manga.score > 0 && <div className={cx('score')}>⭐ Score {manga.score}</div>}
                      <div className={cx('mangaTitle')}>{manga.name}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className={cx('notFoundWrapper')}>
              <img src="https://img.icons8.com/?size=100&id=45967&format=png&color=ffffff" alt="No manga found" className={cx('notFoundImage')} />
              <p className={cx('notFoundMessage')}>Không tìm thấy truyện nào phù hợp.</p>
            </div>
          )}
        </div>

        {mangas?.result && mangas.result.length > 0 && (
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
                  fontSize: '1.5rem',
                  color: '#fff',
                },
                '& .Mui-selected': {
                  backgroundColor: '#EA982B !important',
                  color: '#fff',
                },
              }}
            />
          </Stack>
        )}
      </div>
    </div>
  );
}
