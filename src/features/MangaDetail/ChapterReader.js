import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ChapterReader.module.scss';
import { getChappterManga, getMangaDetail } from '~/services/mangaService';

const cx = classNames.bind(styles);

const ChapterReader = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const url_chapter = queryParams.get('id');
  const slug = queryParams.get('slug');

  const imageRefs = useRef([]);

  const IMG_BASE_URL = 'https://sv1.otruyencdn.com/';

  const [chapter, setChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [urlChapterState, setUrlChapterState] = useState(url_chapter);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentChapterSlug, setCurrentChapterSlug] = useState(null);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  useEffect(() => {
    if (urlChapterState && slug) {
      fetchData();
    }
  }, [urlChapterState, slug]);

  useEffect(() => {
    if (chapter?.item?.chapter_name) {
      setCurrentChapterSlug(chapter.item.chapter_name);
    }
  }, [chapter]);

  useEffect(() => {
    if (imageRefs.current[currentPage - 1]) {
      const top = imageRefs.current[currentPage - 1].offsetTop;
      smoothScrollTo(top, 300);
    }
  }, [currentPage]);

  const smoothScrollTo = (targetY, duration = 300) => {
    const startY = window.scrollY || window.pageYOffset;
    const diff = targetY - startY;
    let startTime;

    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const time = timestamp - startTime;
      const percent = Math.min(time / duration, 1);
      const easePercent = easeInOutQuad(percent);

      window.scrollTo(0, startY + diff * easePercent);

      if (time < duration) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([getDetailChapter(), getDetailManga()]);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setLoading(false);
  };

  const getDetailChapter = async () => {
    try {
      const id = decryptText(urlChapterState);
      const basePath = 'https://sv1.otruyencdn.com/v1/api/chapter/';
      const chapterId = id.replace(basePath, '');
      const res = await getChappterManga(chapterId);
      setChapter(res.data);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    }
  };

  const getDetailManga = async () => {
    try {
      const res = await getMangaDetail({ path: slug });
      setAllChapters(res.result.chapters[0].server_data);
    } catch (error) {
      console.error('Failed to load manga details:', error);
    }
  };

  const decryptText = (encoded) => {
    return decodeURIComponent(escape(atob(encoded)));
  };

  const encryptText = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
  };

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.value));
  };

  const handlePrevPage = () => {
    if (loading) return;
    const currentIndex = allChapters.findIndex((chap) => chap.chapter_name === currentChapterSlug);
    if (currentIndex > 0) {
      const prevChapter = allChapters[currentIndex - 1];
      const encodedSlug = encryptText(prevChapter.chapter_api_data);
      setUrlChapterState(encodedSlug);
      setCurrentChapterSlug(prevChapter.chapter_name);
      setCurrentPage(1);
    }
  };

  const handleNextPage = () => {
    if (loading) return;
    const currentIndex = allChapters.findIndex((chap) => chap.chapter_name === currentChapterSlug);
    if (currentIndex < allChapters.length - 1 && currentIndex !== -1) {
      const nextChapter = allChapters[currentIndex + 1];
      const encodedSlug = encryptText(nextChapter.chapter_api_data);
      setUrlChapterState(encodedSlug);
      setCurrentChapterSlug(nextChapter.chapter_name);
      setCurrentPage(1);
    }
  };

  const toggleChapterDropdown = () => {
    setShowChapterDropdown((prev) => !prev);
  };

  const handleChapterSelect = (chapterApiData) => {
    setShowChapterDropdown(false);
    setUrlChapterState(encryptText(chapterApiData));
    setCurrentPage(1);
  };

  return (
    <div className={cx('readerContainer')}>
      <div className={cx('header')}>
        <h2>
          {chapter?.item?.chapter_title || chapter?.item?.comic_name} - Chương {chapter?.item?.chapter_name}
        </h2>
      </div>

      <div className={cx('imageContainer')}>
        {chapter?.item?.chapter_image.map((url, idx) => (
          <img
            key={idx}
            ref={(el) => (imageRefs.current[idx] = el)}
            src={`${IMG_BASE_URL}${chapter?.item?.chapter_path}/${url.image_file}`}
            loading="lazy"
            alt={`Page ${idx + 1}`}
            className={cx('image')}
          />
        ))}
      </div>

      <div className={cx('controlBar')}>
        <span style={{ color: '#fff' }}>
          {currentPage} / {chapter?.item?.chapter_image.length}
        </span>
        <input type="range" min="1" max={chapter?.item?.chapter_image.length} value={currentPage} onChange={handlePageChange} disabled={loading} />

        <button
          onClick={handlePrevPage}
          disabled={loading || allChapters.findIndex((chap) => chap.chapter_name === currentChapterSlug) <= 0}
          className={cx('btn', {
            disabled: loading || allChapters.findIndex((chap) => chap.chapter_name === currentChapterSlug) <= 0,
          })}
        >
          Trước
        </button>

        <button
          onClick={handleNextPage}
          disabled={loading || allChapters.findIndex((chap) => chap.chapter_name === currentChapterSlug) >= allChapters.length - 1}
          className={cx('btn', {
            disabled: loading || allChapters.findIndex((chap) => chap.chapter_name === currentChapterSlug) >= allChapters.length - 1,
          })}
        >
          Tiếp
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={toggleChapterDropdown} className={cx('chapterDropdownBtn')}>
            Chương khác
          </button>

          {showChapterDropdown && (
            <div className={cx('chapterDropdown')}>
              <strong>Các chương ({allChapters.length})</strong>
              <ul>
                {allChapters.map((chap) => (
                  <li key={chap.chapter_name} onClick={() => handleChapterSelect(chap.chapter_api_data)} className={cx({ active: chap.chapter_name === currentChapterSlug })}>
                    Chương {chap.chapter_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className={cx('loadingModal')}>
          <div className={cx('spinner')}></div>
        </div>
      )}
    </div>
  );
};

export default ChapterReader;
