import { ExploreRounded, FilterListRounded, SearchRounded, SortRounded } from '@mui/icons-material';
import { Pagination, Skeleton, Stack } from '@mui/material';
import classNames from 'classnames/bind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import paths from '~/routes/paths';
import { getCategories, getMangasByCategory, searchMangas } from '~/services/mangaService';
import styles from './AdvancedSearch.module.scss';

const cx = classNames.bind(styles);

export default function AdvancedSearch() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [mangas, setMangas] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(Array.isArray(res?.result) ? res.result : []))
      .catch(() => setCategories([]));
  }, []);

  const handleSearch = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        let res;
        if (keyword.trim()) {
          res = await searchMangas({ keyword: keyword.trim(), page });
        } else if (category) {
          res = await getMangasByCategory({ path: category, page });
        } else {
          res = await getMangasByCategory({ path: 'tat-ca', page });
        }
        setMangas(res);
        setActivePage(page);
      } catch {
        setMangas(null);
      } finally {
        setLoading(false);
      }
    },
    [keyword, category],
  );

  useEffect(() => {
    handleSearch(activePage);
  }, [category, activePage]);

  const sortedResults = useMemo(() => {
    if (!mangas?.result) return [];
    const clone = [...mangas.result];
    if (sortBy === 'name') return clone.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    if (sortBy === 'latest') return clone.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return clone;
  }, [mangas, sortBy]);

  return (
    <main className={cx('searchPage', 'container-fluid')}>
      <div className={cx('container')}>
        <section className={cx('hero')}>
          <h1>
            Tìm kiếm <span>Nâng cao</span>
          </h1>
          <p>Khám phá kho truyện khổng lồ với bộ lọc thông minh.</p>
        </section>

        <section className={cx('filterBar')}>
          <div className={cx('input-group')}>
            <SearchRounded className={cx('icon')} />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)} placeholder="Nhập tên truyện..." />
          </div>
          <div className={cx('select-group')}>
            <FilterListRounded className={cx('icon')} />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setActivePage(1);
              }}
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className={cx('select-group')}>
            <SortRounded className={cx('icon')} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Mới cập nhật</option>
              <option value="name">Tên A - Z</option>
            </select>
          </div>
          <button className={cx('search-btn')} onClick={() => handleSearch(1)}>
            TÌM KIẾM
          </button>
        </section>

        <div className={cx('results-wrapper')}>
          {loading ? (
            <div className={cx('grid')}>
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: '16px' }} />
              ))}
            </div>
          ) : sortedResults.length > 0 ? (
            <>
              <div className={cx('grid')}>
                {sortedResults.map((manga, idx) => (
                  <Link key={idx} to={`${paths.mangaDetail}?slug=${manga.slug}`} className={cx('card-link')}>
                    <div className={cx('manga-card')}>
                      <div className={cx('image-wrapper')}>
                        <div className={cx('badge', manga.status?.toLowerCase())}>{manga.status}</div>
                        <img src={`${IMG_BASE_URL}${manga.thumb_url}`} alt={manga.name} className={cx('img')} loading='lazy' />
                      </div>
                      <div className={cx('info')}>
                        <div className={cx('manga-name')}>{manga.name}</div>
                        <div className={cx('meta')}>
                          {manga.chaptersLatest?.[0] ? (
                            <span className={cx('latest-chapter')}>Chương {manga.chaptersLatest[0].chapter_name}</span>
                          ) : (
                            <span className={cx('status-text')}>Updating</span>
                          )}
                          <span className={cx('update-time')}>{new Date(manga.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* --- PAGINATION TO VẬT VÃ --- */}
              {mangas?.page && Number(mangas.page.totalItems) > Number(mangas.page.totalItemsPerPage) && (
                <Stack alignItems="center" sx={{ mt: 8, mb: 4 }}>
                  <Pagination
                    page={activePage}
                    count={Math.ceil(Number(mangas.page.totalItems) / Number(mangas.page.totalItemsPerPage))}
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
            </>
          ) : (
            <div className={cx('empty')}>
              <ExploreRounded className={cx('empty-icon')} />
              <p>Không tìm thấy truyện nào!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
