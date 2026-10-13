import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import AdSlot from '~/components/common/AdSlot';
import PremiumGate from '~/components/monetization/PremiumGate';
import ReaderSettingsPanel from '~/components/reading/ReaderSettingsPanel';
import ResumeReadingDialog from '~/components/reading/ResumeReadingDialog';
import ShareChapterDialog from '~/components/reading/ShareChapterDialog';
import { useReaderSettings } from '~/hooks/useReaderSettings';
import { errorCode, errorMessage, unwrapList } from '~/lib/httpRequest';
import { useUser } from '~/providers/UserContext';
import { adminService } from '~/services/adminService';
import { createBookmark, deleteBookmark, getBookmarkStatus } from '~/services/bookmarkService';
import { getChapter, isPaywalled, paywallPayload, unlockChapter } from '~/services/chapterService';
import { refreshWallet } from '~/services/coinService';
import { followManga } from '~/services/followService';
import { saveHistory } from '~/services/historyService';
import { getMangaDetail } from '~/services/mangaService';
import readingProgressService from '~/services/readingProgressService';
import { createReadingSession } from '~/services/readingAnalyticsService';
import { awardXp, XP_REWARDS } from '~/services/xpService';
import CommentSection from './CommentSection';
import styles from './ChapterReader.module.scss';

const cx = classNames.bind(styles);

const ChapterReader = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const url_chapter = queryParams.get('id');
  const slug = queryParams.get('slug');
  const startPage = Number(queryParams.get('page')) || 0;
  const wantsRestart = queryParams.get('restart') === '1';

  const imageRefs = useRef([]);

  const IMG_BASE_URL = 'https://sv1.otruyencdn.com/';

  const { userId } = useUser();
  const { settings, backgroundColor, maxWidth, isDark } = useReaderSettings();

  const [chapter, setChapter] = useState(null);
  const [mangaMeta, setMangaMeta] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [urlChapterState, setUrlChapterState] = useState(url_chapter);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentChapterSlug, setCurrentChapterSlug] = useState(null);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [adsData, setAdsData] = useState(null);
  // Rule 5: set only when the server answers PAYWALL_LOCKED. Every field here
  // comes from the error payload, never from client-derived state.
  const [paywall, setPaywall] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  // --- Smart reading state ---
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [readSeconds, setReadSeconds] = useState(0);
  const scrollTicker = useRef(null);
  const lastPersisted = useRef(0);

  const totalPages = chapter?.item?.chapter_image?.length || 0;
  const progressPercent = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  const chapterIndex = useMemo(
    () => allChapters.findIndex((c) => c.chapter_name === currentChapterSlug),
    [allChapters, currentChapterSlug],
  );

  const nextChapter = useMemo(
    () => (chapterIndex >= 0 && chapterIndex < allChapters.length - 1 ? allChapters[chapterIndex + 1] : null),
    [allChapters, chapterIndex],
  );

  const hasNewChapter = useMemo(() => {
    const latest = Number(allChapters[allChapters.length - 1]?.chapter_name);
    const current = Number(currentChapterSlug);
    return Number.isFinite(latest) && Number.isFinite(current) && latest > current;
  }, [allChapters, currentChapterSlug]);

  useEffect(() => {
    if (urlChapterState && slug) {
      fetchData();
    }
    loadAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlChapterState, slug]);

  useEffect(() => {
    if (chapter?.item?.chapter_name) {
      setCurrentChapterSlug(chapter.item.chapter_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.item?.chapter_name]);

  useEffect(() => {
    if (imageRefs.current[currentPage - 1]) {
      const top = imageRefs.current[currentPage - 1].offsetTop;
      smoothScrollTo(top, 300);
    }
  }, [currentPage]);

  /**
   * DEEP-LINKED PAGE.
   * `?page=N` (from the resume dialog, a shared link, or "continue reading")
   * must jump the reader straight to that page once the images have rendered.
   * Guarded so it only runs once per chapter.
   */
  useEffect(() => {
    if (!startPage || startPage <= 1 || !totalPages) return undefined;
    const target = Math.min(startPage, totalPages);

    const scrollToTarget = () => {
      const node = imageRefs.current[target - 1];
      if (node) {
        smoothScrollTo(node.offsetTop, 300);
        setCurrentPage(target);
        return true;
      }
      return false;
    };

    if (scrollToTarget()) return undefined;

    // Images are lazy-loaded, so the node may not exist yet — retry briefly.
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (scrollToTarget() || attempts > 20) clearInterval(timer);
    }, 150);
    return () => clearInterval(timer);
  }, [startPage, totalPages]);

  /**
   * REAL PAGE TRACKING.
   * The old reader only knew the page because the reader dragged a slider —
   * but readers scroll. This derives the current page from scroll position
   * (throttled with rAF), which is what makes "Page 37 / 52" truthful.
   */
  useEffect(() => {
    if (settings.mode !== 'scroll' || !totalPages) return undefined;

    const onScroll = () => {
      if (scrollTicker.current) return;
      scrollTicker.current = requestAnimationFrame(() => {
        scrollTicker.current = null;
        const nodes = imageRefs.current.filter(Boolean);
        if (!nodes.length) return;
        const threshold = window.innerHeight * 0.4;
        let found = 1;
        for (let i = 0; i < nodes.length; i += 1) {
          if (nodes[i].getBoundingClientRect().top <= threshold) found = i + 1;
          else break;
        }
        setCurrentPage((prev) => (prev === found ? prev : found));
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTicker.current) cancelAnimationFrame(scrollTicker.current);
    };
  }, [settings.mode, totalPages]);

  /**
   * PERSIST PROGRESS (LOCAL).
   * Throttled to one write per ~1.5s and on unmount, so scrolling a long
   * chapter does not hammer localStorage. Works for guests too — resume must
   * not require an account.
   */
  useEffect(() => {
    if (!slug || !currentChapterSlug || !totalPages) return;
    const now = Date.now();
    if (now - lastPersisted.current < 1500) return;
    lastPersisted.current = now;

    readingProgressService.saveChapterProgress({
      mangaPath: slug,
      mangaName: chapter?.item?.comic_name || mangaMeta?.name,
      thumbnailUrl: mangaMeta?.thumb_url,
      genres: (mangaMeta?.category || []).map((c) => c.name).filter(Boolean),
      chapterName: currentChapterSlug,
      chapterApiData: chapter?.item?.chapter_path ? `${chapter.item.chapter_path}` : null,
      chapterTitle: chapter?.item?.chapter_title,
      currentPage,
      totalPages,
      minutesRead: Math.round(readSeconds / 60),
    });
  }, [currentPage, totalPages, currentChapterSlug, slug, chapter, mangaMeta, readSeconds]);

  // Flush the last position when leaving the reader.
  useEffect(
    () => () => {
      if (!slug || !currentChapterSlug || !totalPages) return;
      readingProgressService.saveChapterProgress({
        mangaPath: slug,
        mangaName: chapter?.item?.comic_name,
        chapterName: currentChapterSlug,
        chapterApiData: chapter?.item?.chapter_path,
        chapterTitle: chapter?.item?.chapter_title,
        currentPage,
        totalPages,
        minutesRead: Math.max(1, Math.round(readSeconds / 60)),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, currentChapterSlug, totalPages],
  );

  /** SMART READING RESUME — ask, don't force. */
  useEffect(() => {
    if (wantsRestart || startPage > 0 || !slug || !currentChapterSlug || !totalPages) return;
    const saved = readingProgressService.getChapterProgress(slug, currentChapterSlug);
    if (!saved || saved.currentPage <= 1 || saved.percent >= 98) return;
    if (saved.currentPage >= totalPages) return;
    if (!settings.resumePrompt) return;

    setResumePrompt({
      currentPage: saved.currentPage,
      totalPages: saved.totalPages || totalPages,
      percent: saved.percent,
      readAt: saved.lastReadAt,
      completed: Boolean(saved.completed),
    });
  }, [slug, currentChapterSlug, totalPages, wantsRestart, startPage, settings.resumePrompt]);

  /** Keep the screen awake for long sessions (Premium-gated setting). */
  useEffect(() => {
    if (!settings.keepScreenAwake || !('wakeLock' in navigator)) return undefined;
    let lock = null;
    let cancelled = false;
    navigator.wakeLock
      .request('screen')
      .then((l) => {
        if (cancelled) l.release?.();
        else lock = l;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      lock?.release?.().catch(() => {});
    };
  }, [settings.keepScreenAwake]);

  /** Reading-time accumulator (drives local stats + daily minute goals). */
  useEffect(() => {
    const id = setInterval(() => setReadSeconds((s) => s + 30), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!userId || !slug || !currentChapterSlug) return;

    // REAL API — existing calls, unchanged. `updateProgress` was removed on
    // purpose: it is a follow-progress write, and firing it on every chapter
    // open was creating follow rows for readers who never followed. Follow
    // progress is now written only after an explicit follow (see below).
    //
    // Rule 3: no `userId` in these write bodies — the JWT identifies the caller
    // and a mismatched id would come back as `403 USER_ID_MISMATCH`.
    saveHistory({
      mangaPath: slug,
      chapterName: currentChapterSlug,
      mangaName: chapter?.item?.comic_name,
      // `[0]` without `?.` throws when a chapter has no pages yet.
      thumbnailUrl: chapter?.item?.chapter_path + '/' + (chapter?.item?.chapter_image?.[0]?.image_file ?? ''),
    }).catch(() => {});

    createReadingSession({
      mangaPath: slug,
      chapterName: currentChapterSlug,
      mangaName: chapter?.item?.comic_name,
      minutesRead: 1,
      chaptersRead: chapter?.item?.chapter_name,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, slug, currentChapterSlug, chapter?.item?.comic_name]);

  /**
   * CHAPTER COMPLETION — the moment that drives streak, goal, XP and the
   * "next chapter" prompt. Fires exactly once per chapter thanks to the
   * chapter-scoped XP event id, so remounting cannot farm it.
   */
  useEffect(() => {
    if (!totalPages || currentPage < totalPages || !currentChapterSlug) return;

    readingProgressService.markChapterCompleted({ mangaPath: slug, chapterName: currentChapterSlug });
    const result = awardXp(XP_REWARDS.COMPLETE_CHAPTER, `chapter:${slug}:${currentChapterSlug}:done`);
    if (result.gained) toast.success(`🎉 Hoàn thành chương ${currentChapterSlug}! +${result.gained} XP`);
    if (result.leveledUp) toast.success(`🏅 Lên cấp ${result.newLevel}!`);
    setJustCompleted(true);

    // Optional auto-advance (Premium setting) — still one click is safer, so
    // this only triggers when the reader explicitly enabled it.
    if (settings.autoNextChapter && nextChapter) {
      const timer = setTimeout(() => handleChapterSelect(nextChapter.chapter_api_data), 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages, currentChapterSlug, slug, nextChapter, settings.autoNextChapter]);

  /**
   * Chapter access is NOT computed here.
   * Rule 5: the server decides, by rejecting the chapter request with
   * `403 PAYWALL_LOCKED`. The local rule engine would drift from the real price
   * and could let a reader into a chapter the backend intends to charge for.
   */

  useEffect(() => {
    if (!userId || !slug || !currentChapterSlug) {
      setBookmarked(false);
      return;
    }
    getBookmarkStatus({ userId, mangaPath: slug, chapterName: currentChapterSlug })
      .then(({ data }) => setBookmarked(Boolean(data?.result)))
      .catch(() => setBookmarked(false));
  }, [userId, slug, currentChapterSlug]);

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
    const chapterId = resolveChapterId(decryptText(urlChapterState));
    if (!chapterId) {
      setChapter(null);
      toast.error('Link chương không hợp lệ.');
      return;
    }
    try {
      // Rule 5: the server decides whether this chapter can be read. A locked
      // chapter rejects with 403 PAYWALL_LOCKED but STILL carries a payload —
      // we read it to drive the modal instead of guessing a price client-side.
      const { data } = await getChapter(chapterId);

      setChapter(data?.result ?? null);
      setPaywall(null);
    } catch (error) {
      if (isPaywalled(error)) {
        const { accessType, price, chapterName, mangaPath } = paywallPayload(error) ?? {};
        setChapter(null);
        setPaywall({
          chapterId,
          accessType: accessType || 'PREMIUM',
          price: Number(price ?? 0),
          chapterName: chapterName ?? currentChapterSlug,
          mangaPath: mangaPath ?? slug,
          index: chapterIndex,
          totalChapters: allChapters.length,
        });
        return;
      }

      setChapter(null);
      // `CHAPTER_NOT_FOUND` -> let the router's 404 handle it.
      if (errorCode(error) === 'CHAPTER_NOT_FOUND') {
        toast.error('Không tìm thấy chương này.');
        return;
      }
      toast.error(errorMessage(error, 'Không tải được chương. Vui lòng thử lại.'));
    }
  };

  const getDetailManga = async () => {
    try {
      const { data } = await getMangaDetail({ path: slug });
      const detail = data?.result ?? null;
      setMangaMeta(detail);
      // ⚠️ Chapters are NESTED: `chapters[0].server_data` (not `chapters`).
      setAllChapters(Array.isArray(detail?.chapters) ? detail.chapters[0]?.server_data ?? [] : []);
    } catch (error) {
      setMangaMeta(null);
      setAllChapters([]);
      if (errorCode(error) === 'MANGA_NOT_FOUND') {
        toast.error('Không tìm thấy truyện này.');
        return;
      }
      toast.error(errorMessage(error, 'Không tải được thông tin truyện.'));
    }
  };

  const loadAds = async () => {
    const targetUrl = '/manga/' + slug;
    const now = new Date();

    const localDateTime =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      'T' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');

    // A failed ad request is not a reader-facing error — the AdSlot already
    // degrades to a labelled placeholder, so we only log it here.
    try {
      // Rule 5: `GET /admin/ads` is the ONLY public ad endpoint (no token needed).
      const { data } = await adminService.getAds({ targetUrl, endAt: localDateTime });
      setAdsData(unwrapList({ data }));
    } catch (error) {
      setAdsData([]);
    }
  };

  /**
   * Pay a locked chapter with coins.
   * `unlockChapter` is idempotent: `true` = just unlocked (coins deducted),
   * `false` = already owned (nothing charged).
   */
  const handleUnlockChapter = async (gate) => {
    setUnlocking(true);
    try {
      // `price` comes from the server's PAYWALL_LOCKED payload — never guessed.
      const charged = await unlockChapter(gate.chapterId, gate.price);
      toast.success(charged ? `Đã mở khóa chương với ${gate.price} Coin.` : 'Bạn đã sở hữu chương này.');
      await Promise.all([getDetailChapter(), refreshWallet()]);
    } catch (error) {
      const code = errorCode(error);
      if (code === 'INSUFFICIENT_COINS') {
        toast.error('Bạn không đủ Coin. Vui lòng nạp thêm để mở khóa chương này.');
        return;
      }
      toast.error(errorMessage(error, 'Không mở khóa được chương. Vui lòng thử lại.'));
    } finally {
      setUnlocking(false);
    }
  };


  /**
 * Decode the base64 `?id=` value coming from a chapter deep link.
 *
 * ⚠️ Must not throw: the value arrives from the URL, so a malformed or
 * truncated link would otherwise crash the reader on a blank screen.
 * Returns `''` instead — `resolveChapterId` turns that into a visible message.
 */
const decryptText = (encoded) => {
  if (!encoded) return '';
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    // Some links may already be plain text rather than base64.
    return encoded;
  }
};

const encryptText = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
};

/**
 * `chapter_api_data` is the base64 of an ABSOLUTE CDN URL
 * (`https://sv1.otruyencdn.com/v1/api/chapter/chapter-1`), but
 * `GET /api/chapter/{chapterId}` expects only the trailing id.
 *
 * Taking the LAST path segment handles every shape the backend might send:
 *   full URL -> "chapter-1"
 *   "https://host/api/chapter/chapter-1?x=1" -> "chapter-1"
 *   bare id  -> "chapter-1"
 * Passing the whole URL as a path variable produces a broken request.
 */
const resolveChapterId = (decoded) => {
  if (!decoded) return '';
  const withoutQuery = String(decoded).split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments.length ? segments[segments.length - 1] : withoutQuery;
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
    if (!chapterApiData) return;
    setShowChapterDropdown(false);
    setUrlChapterState(encryptText(chapterApiData));
    setCurrentPage(1);
    setResumePrompt(null);
    setJustCompleted(false);
    setPaywall(null);
  };

  /** Follow the comic on demand — this is what makes "new chapter alerts" work. */
  const handleFollowFromReader = async () => {
    if (!userId) {
      toast.info('Đăng nhập để theo dõi truyện và nhận thông báo chương mới.');
      return;
    }
    try {
      // Rule 3: no `userId` — the backend resolves the follower from the JWT.
      await followManga({
        mangaPath: slug,
        mangaName: chapter?.item?.comic_name || mangaMeta?.name,
        thumbnailUrl: mangaMeta?.thumb_url,
      });
      toast.success('Đã theo dõi — bạn sẽ nhận thông báo khi có chương mới.');
    } catch (error) {
      toast.error(errorMessage(error, 'Không theo dõi được. Vui lòng thử lại.'));
    }
  };

  const handleToggleBookmark = async () => {
    if (!userId || !slug || !currentChapterSlug || bookmarkLoading) return;
    const prev = bookmarked;
    setBookmarked(!prev);
    setBookmarkLoading(true);
    try {
      // Rule 3: no `userId` in these write bodies.
      if (prev) {
        await deleteBookmark({ mangaPath: slug, chapterName: currentChapterSlug });
      } else {
        await createBookmark({
          mangaPath: slug,
          thumbnailUrl: chapter?.item?.chapter_path + '/' + chapter?.item?.chapter_image?.[0]?.image_file,
          chapterName: currentChapterSlug,
          mangaName: chapter?.item?.comic_name,
        });
      }
    } catch {
      setBookmarked(prev);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div className={styles.readerShell} style={{ background: backgroundColor, color: isDark ? '#e8e6e3' : undefined }}>
      {/* AD-FREE BENEFIT: AdSlot renders nothing for Premium members. */}
      <AdSlot ad={adsData?.[0]} slot="rail" label="Quảng cáo" />

      <div className={cx('readerContainer')} style={{ maxWidth }}>
        {/* --- PROGRESS BAR (SMART PROGRESS) --- */}
        {settings.showProgress && totalPages > 0 && (
          <div
            className={styles.progressTop}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressTopFill} style={{ width: `${Math.max(1, progressPercent)}%` }} />
          </div>
        )}

        <div className={cx('header')}>
          {settings.showChapterTitle && (
            <h2>
              {chapter?.item?.chapter_title || chapter?.item?.comic_name} - Chương {chapter?.item?.chapter_name}
            </h2>
          )}
          <div className={styles.headerMeta}>
            {/*
              The access pill reflects the SERVER verdict for the chapter that is
              currently open: absent when free, otherwise the type/price the
              backend reported through PAYWALL_LOCKED.
            */}
            {paywall && (
              <span className={styles.accessPill} data-tone={paywall.accessType === 'EARLY_ACCESS' ? 'early' : 'premium'}>
                {paywall.accessType === 'EARLY_ACCESS' ? '⏩ Xem trước' : `💎 Premium · ${paywall.price} Coin`}
              </span>
            )}
            <span className={styles.pageCounter}>
              Trang {currentPage} / {totalPages} · {progressPercent}%
            </span>
            <button type="button" className={styles.headBtn} onClick={() => setSettingsOpen(true)}>
              ⚙️ Cài đặt
            </button>
            <button type="button" className={styles.headBtn} onClick={() => setShareOpen(true)}>
              🔗 Chia sẻ
            </button>
            {userId && (
              <button type="button" className={styles.headBtn} onClick={handleFollowFromReader}>
                🔔 Theo dõi
              </button>
            )}
          </div>
        </div>

        {/*
          Rule 5: the LOCKED state is whatever the server said. When the chapter
          request came back PAYWALL_LOCKED there are no images to render at all,
          so we show the paywall notice and open the modal on demand.
        */}
        {paywall ? (
          <div className={styles.gateBlock}>
            <div className={styles.gateIcon}>{paywall.accessType === 'EARLY_ACCESS' ? '⏩' : '💎'}</div>
            <h3 className={styles.gateTitle}>
              {paywall.accessType === 'EARLY_ACCESS' ? 'Chương xem trước' : 'Chương Premium'}
            </h3>
            <p className={styles.gateText}>
              Chương {paywall.chapterName}
              {paywall.accessType === 'EARLY_ACCESS'
                ? ' dành cho thành viên Premium đọc sớm.'
                : ` mở khóa với ${paywall.price.toLocaleString('vi-VN')} Coin, hoặc nâng cấp Premium để đọc không giới hạn.`}
            </p>
            <button type="button" className={styles.gateBtn} onClick={() => setPaywall({ ...paywall })}>
              {paywall.accessType === 'EARLY_ACCESS' ? 'Xem gói Premium' : 'Mở khóa chương này'}
            </button>
          </div>
        ) : !chapter ? (
          <div className={styles.gateBlock}>
            <div className={styles.gateIcon}>📖</div>
            <h3 className={styles.gateTitle}>Chưa tải được chương</h3>
            <p className={styles.gateText}>Vui lòng kiểm tra kết nối hoặc thử lại sau.</p>
          </div>
        ) : (
          <>
            <AdSlot ad={adsData?.[2]} slot="inline" label="Quảng cáo" />

            <div
              className={cx('imageContainer', { paged: settings.mode === 'paged' })}
              style={settings.zoom !== 1 ? { '--reader-zoom': settings.zoom } : undefined}
            >
              {chapter?.item?.chapter_image.map((url, idx) => (
                <img
                  key={idx}
                  ref={(el) => (imageRefs.current[idx] = el)}
                  src={`${IMG_BASE_URL}${chapter?.item?.chapter_path}/${url.image_file}`}
                  loading="lazy"
                  alt={`Trang ${idx + 1}`}
                  className={cx('image')}
                />
              ))}
            </div>

            {/* --- CHAPTER COMPLETE / NEW CHAPTER --- */}
            {(justCompleted || hasNewChapter) && (
              <div className={styles.completeBox}>
                <div className={styles.completeHead}>
                  <span className={styles.completeIcon}>{hasNewChapter ? '🆕' : '✅'}</span>
                  <div>
                    <h3 className={styles.completeTitle}>
                      {hasNewChapter ? 'Đã có chương mới!' : 'Bạn đã đọc xong chương này'}
                    </h3>
                    <p className={styles.completeText}>
                      {nextChapter
                        ? `Chương ${nextChapter.chapter_name} đang chờ bạn.`
                        : 'Bạn đã đọc hết các chương hiện có.'}
                    </p>
                  </div>
                </div>
                <div className={styles.completeActions}>
                  <button
                    type="button"
                    className={styles.completePrimary}
                    onClick={() => (nextChapter ? handleChapterSelect(nextChapter.chapter_api_data) : null)}
                    disabled={!nextChapter}
                  >
                    {nextChapter ? `Đọc chương ${nextChapter.chapter_name}` : 'Đã đọc hết'}
                  </button>
                  <button type="button" className={styles.completeGhost} onClick={() => setShareOpen(true)}>
                    Chia sẻ chương này
                  </button>
                </div>
              </div>
            )}

            <AdSlot ad={adsData?.[3]} slot="inline" label="Quảng cáo" />
          </>
        )}

        <div className={cx('controlBar')}>
          <span>
            {currentPage} / {totalPages}
          </span>
          <input type="range" min="1" max={totalPages} value={currentPage} onChange={handlePageChange} disabled={loading} />

          <button
            onClick={handlePrevPage}
            disabled={loading || chapterIndex <= 0}
            className={cx('btn', { disabled: loading || chapterIndex <= 0 })}
          >
            Trước
          </button>

          <button
            onClick={handleNextPage}
            disabled={loading || chapterIndex >= allChapters.length - 1}
            className={cx('btn', { disabled: loading || chapterIndex >= allChapters.length - 1 })}
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
                  {/*
                    The list shows no lock icons: per Rule 5 only the server knows
                    which chapters are paid, and it reveals that one chapter at a
                    time via PAYWALL_LOCKED. Guessing here would advertise the
                    wrong price — selecting a locked chapter simply opens the
                    paywall modal.
                  */}
                  {allChapters.map((chap) => (
                    <li
                      key={chap.chapter_name}
                      onClick={() => handleChapterSelect(chap.chapter_api_data)}
                      className={cx({ active: chap.chapter_name === currentChapterSlug })}
                    >
                      <span>Chương {chap.chapter_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleToggleBookmark}
            disabled={!userId || !currentChapterSlug || bookmarkLoading}
            className={cx('btn', { disabled: !userId || !currentChapterSlug || bookmarkLoading })}
            title={!userId ? 'Đăng nhập để đánh dấu chương' : ''}
          >
            {bookmarkLoading ? '...' : bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu chương'}
          </button>
        </div>
        {loading && (
          <div className={cx('loadingModal')}>
            <div className={cx('spinner')}></div>
          </div>
        )}
        {/* Bình luận chapter */}
        {slug && currentChapterSlug && (
          <div style={{ padding: '0 20px', maxWidth: 900, margin: '0 auto' }}>
            <CommentSection mangaPath={slug} chapterName={currentChapterSlug} mangaName={chapter?.item?.comic_name} />
          </div>
        )}
      </div>

      <AdSlot ad={adsData?.[1]} slot="rail" label="Quảng cáo" />

      {/* --- DIALOGS --- */}
      <ReaderSettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <ResumeReadingDialog
        open={Boolean(resumePrompt)}
        onClose={() => setResumePrompt(null)}
        mangaPath={slug}
        chapterName={currentChapterSlug}
        currentPage={resumePrompt?.currentPage}
        totalPages={resumePrompt?.totalPages}
        percent={resumePrompt?.percent}
        readAt={resumePrompt?.readAt}
        completed={resumePrompt?.completed}
        nextChapter={nextChapter}
        hasNewChapter={hasNewChapter}
        latestChapter={hasNewChapter ? allChapters[allChapters.length - 1] : null}
        chapterApiData={chapter?.item?.chapter_path}
      />

      {/*
        Rule 5 — the paywall modal is driven ENTIRELY by the server.
        `accessType` and `price` come from the PAYWALL_LOCKED error payload,
        never from the local mock access rules, and unlocking calls the real
        `POST /wallet/unlock-chapter`.
      */}
      <PremiumGate
        open={Boolean(paywall)}
        onClose={() => setPaywall(null)}
        busy={unlocking}
        mangaPath={paywall?.mangaPath ?? slug}
        chapterName={paywall?.chapterName ?? currentChapterSlug}
        chapterIndex={paywall?.index}
        totalChapters={paywall?.totalChapters}
        accessType={paywall?.accessType}
        price={paywall?.price}
        onUnlock={() => handleUnlockChapter(paywall)}
        onUnlocked={() => setPaywall(null)}
      />

      <ShareChapterDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        manga={{ ...(mangaMeta || {}), slug, name: chapter?.item?.comic_name }}
        chapter={chapter?.item}
        chapterApiData={chapter?.item?.chapter_path}
      />
    </div>
  );
};

export default ChapterReader;
