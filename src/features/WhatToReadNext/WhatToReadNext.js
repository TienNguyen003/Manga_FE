import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ErrorState, LoadingSpinner } from '~/components/common/AsyncState';
import discoveryService, {
  MOODS,
  PACE_FILTERS,
  STATUS_FILTERS,
  getDiscoveryPreferences,
  resetDiscoveryPreferences,
  saveDiscoveryPreferences,
} from '~/services/discoveryService';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import styles from './WhatToReadNext.module.scss';

const cx = classNames.bind(styles);
const IMG_BASE = process.env.REACT_APP_IMAGE_BASE_URL || '';
const CDN = 'https://sv1.otruyencdn.com/';

const coverSrc = (thumb) => {
  if (!thumb) return '';
  if (/^https?:\/\//i.test(thumb)) return thumb;
  if (thumb.startsWith('uploads/comics/')) return `${IMG_BASE}${thumb}`;
  return `${CDN}${thumb}`;
};

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

/**
 * WhatToReadNext - "TOI NEN DOC GI TIEP?" (P1)
 *
 * The highest-leverage discovery feature: it shortens the distance between
 * "I have ten minutes" and "chapter 1 is open".
 *
 * Every result comes from endpoints the backend already exposes. The chosen
 * signals persist locally so the next visit is pre-filled and the reader does
 * not re-answer questions they already answered.
 */
export default function WhatToReadNext() {
  const { userId } = useUser();
  const [prefs, setPrefs] = useState(getDiscoveryPreferences);
  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    discoveryService.getAvailableGenres().then(setGenres);
  }, []);

  const update = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveDiscoveryPreferences(patch);
  };

  const handleFind = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await discoveryService.findSomethingToRead(prefs, { userId });
      setResults(response.results);
      setSearched(true);
    } catch {
      setError('Không tìm được truyện phù hợp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const next = resetDiscoveryPreferences();
    setPrefs(next);
    setResults([]);
    setSearched(false);
  };

  const activeCount =
    prefs.moods.length + prefs.genres.length + (prefs.pace ? 1 : 0) + (prefs.status ? 1 : 0) + (prefs.keyword ? 1 : 0);

  return (
    <main className={cx('page', 'container-fluid')}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <span className={styles.kicker}>Gợi ý nhanh</span>
          <h1 className={styles.title}>
            Hôm nay bạn muốn đọc <span>gì?</span>
          </h1>
          <p className={styles.sub}>Chọn vài sở thích — chúng tôi tìm truyện hợp với bạn trong vài giây.</p>
        </header>

        <section className={styles.panel}>
          <div className={styles.group}>
            <span className={styles.groupLabel}>Tâm trạng</span>
            <div className={styles.chipRow}>
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  className={cx('chip', { active: prefs.moods.includes(mood.id) })}
                  onClick={() => update({ moods: toggle(prefs.moods, mood.id) })}
                >
                  <span className={styles.chipEmoji}>{mood.emoji}</span> {mood.label}
                </button>
              ))}
            </div>
          </div>

          {genres.length > 0 && (
            <div className={styles.group}>
              <span className={styles.groupLabel}>Thể loại</span>
              <div className={styles.chipRow}>
                {genres.map((genre) => (
                  <button
                    key={genre.slug}
                    type="button"
                    className={cx('chip', { active: prefs.genres.includes(genre.slug) })}
                    onClick={() => update({ genres: toggle(prefs.genres, genre.slug) })}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.group}>
            <span className={styles.groupLabel}>Độ dài</span>
            <div className={styles.chipRow}>
              {PACE_FILTERS.map((pace) => (
                <button
                  key={pace.id}
                  type="button"
                  className={cx('chip', { active: prefs.pace === pace.id })}
                  onClick={() => update({ pace: prefs.pace === pace.id ? null : pace.id })}
                >
                  {pace.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupLabel}>Tình trạng</span>
            <div className={styles.chipRow}>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={cx('chip', { active: prefs.status === s.id })}
                  onClick={() => update({ status: prefs.status === s.id ? null : s.id })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupLabel}>Từ khoá</span>
            <input
              className={styles.input}
              value={prefs.keyword}
              onChange={(e) => update({ keyword: e.target.value })}
              placeholder="Ví dụ: hệ thống, isekai, tình yêu học đường..."
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={cx('btn', 'primary')} onClick={handleFind} disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm truyện phù hợp'}
            </button>
            {activeCount > 0 && (
              <button type="button" className={cx('btn', 'ghost')} onClick={handleReset}>
                Xoá lựa chọn ({activeCount})
              </button>
            )}
          </div>
        </section>

        {error && <ErrorState text={error} onRetry={handleFind} />}
        {loading && <LoadingSpinner text="Đang tìm truyện cho bạn..." />}

        {searched && !loading && !error && (
          <section className={styles.results}>
            <h2 className={styles.resultsTitle}>
              {results.length > 0 ? `${results.length} truyện gợi ý` : 'Không tìm thấy truyện phù hợp'}
            </h2>

            {results.length === 0 ? (
              <div className={styles.emptyBox}>
                <p>Thử bỏ bớt bộ lọc, hoặc khám phá theo thể loại.</p>
                <Link to={paths.category} className={cx('btn', 'primary')}>
                  Xem tất cả thể loại
                </Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {results.map((manga) => (
                  <Link
                    key={manga.slug}
                    to={`${paths.mangaDetail}?slug=${encodeURIComponent(manga.slug)}`}
                    className={styles.card}
                  >
                    <div className={styles.coverWrap}>
                      {manga.thumb ? (
                        <img src={coverSrc(manga.thumb)} alt={manga.title} loading="lazy" className={styles.cover} />
                      ) : (
                        <div className={styles.coverFallback}>{(manga.title || '?').charAt(0)}</div>
                      )}
                      {manga.alreadyRead && <span className={styles.readTag}>Đã đọc</span>}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTitle}>{manga.title}</div>
                      <div className={styles.cardMeta}>
                        {manga.statusLabel && <span className={styles.status}>{manga.statusLabel}</span>}
                        <span>{manga.chapters ? `${manga.chapters} chương` : '—'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
