import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './AdvancedSearch.module.scss';
import paths from '~/routes/paths';
import MangaCard from '~/components/common/MangaCard';
import { getCategories, getMangasByCategory, searchMangas } from '~/services/mangaService';

const cx = classNames.bind(styles);

export default function AdvancedSearch() {
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(Array.isArray(res?.result) ? res.result : []))
      .catch(() => setCategories([]));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let list = [];
      if (keyword.trim()) {
        const res = await searchMangas({ keyword: keyword.trim(), page: 1 });
        list = res?.result || [];
      } else if (category) {
        const res = await getMangasByCategory({ path: category, page: 1 });
        list = res?.result || [];
      }
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    const clone = [...results];
    if (sortBy === 'name') {
      return clone.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }
    if (sortBy === 'latest') {
      return clone.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    }
    return clone.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  }, [results, sortBy]);

  return (
    <main className={cx('searchPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Tìm kiếm nâng cao</h1>
          <p>Trang mới với bộ lọc nhiều tiêu chí để chuẩn bị cho backend search engine.</p>
        </section>

        <section className={cx('filterBar')}>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Từ khóa truyện..." />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Chọn thể loại</option>
            {categories.map((item) => (
              <option key={item.slug || item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Sắp xếp: Điểm cao</option>
            <option value="latest">Sắp xếp: Mới cập nhật</option>
            <option value="name">Sắp xếp: A-Z</option>
          </select>

          <button type="button" onClick={handleSearch}>
            Tìm kiếm
          </button>
        </section>

        {loading && <div className={cx('state')}>Đang tìm truyện...</div>}

        {!loading && sortedResults.length === 0 && (
          <div className={cx('state')}>
            Chưa có kết quả. Bạn có thể thử <Link to={paths.discover}>trang khám phá</Link>.
          </div>
        )}

        {!loading && sortedResults.length > 0 && (
          <section className={cx('grid')}>
            {sortedResults.slice(0, 20).map((manga, idx) => (
              <MangaCard key={`${manga.slug || manga.name}-${idx}`} manga={manga} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
