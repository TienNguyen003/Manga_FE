import {
  BookmarkAddedRounded,
  BookmarkAddRounded,
  ChatBubbleRounded,
  DownloadRounded,
  FolderSpecialRounded,
  PeopleAltRounded,
  PlaylistAddRounded,
  StarRounded,
} from '@mui/icons-material';
import { Avatar, CircularProgress, Menu, MenuItem, Pagination, Stack, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { unwrapList } from '~/lib/httpRequest';
import { useUser } from '~/providers/UserContext';
import ContentBadge from '~/components/common/ContentBadge';
import PremiumGate from '~/components/monetization/PremiumGate';
import { useContentAccess } from '~/hooks/useContentAccess';
import { useReadingProgress } from '~/hooks/useReadingProgress';
import readingProgressService from '~/services/readingProgressService';
import { encodeChapterApiData } from '~/services/shareService';
import { timeAgo } from '~/lib/date';
import paths from '~/routes/paths';
import { addCollectionItem, getCollections } from '~/services/collectionService';
import { followManga, getFollowStatus, unfollowManga } from '~/services/followService';
import { getMangaDetail } from '~/services/mangaService';
import { getMyRating, getRatingSummary, getReviews, submitRating } from '~/services/ratingService';
import { getRecommendationsMangas } from '~/services/recommendationService';
import { getMangaStats } from '~/services/statsService';
import styles from './MangaDetail.module.scss';

const cx = classNames.bind(styles);

const MangaDetail = () => {
  const [mangas, setManga] = useState({});
  const [activePage, setActivePage] = useState(1);
  const { userId } = useUser();

  // States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  // The reader's own rating is hydrated into `ratingInput` + `reviewText` (which
  // drive the star row and the textarea), so there is no separate `myRating`
  // state — keeping one would only duplicate the same value.
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [recommendationItems, setRecommendationItems] = useState([]);

  // --- Smart reading / access state ---
  const { resolve, summarise } = useContentAccess();
  const [gateChapter, setGateChapter] = useState(null);
  // Fallback source for "where was I": local progress is authoritative for the
  // page number, and works even before any API call resolves.
  const [localEntry, setLocalEntry] = useState(null);

  // Collection Menu State
  const [collections, setCollections] = useState([]);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const location = useLocation();
  const slug = new URLSearchParams(location.search).get('slug');

  // `mangas.chapters` is a nested array from the API; memoise so the access
  // roll-up below is not recomputed on every render.
  const serverData = useMemo(() => mangas.chapters?.[0]?.server_data || [], [mangas.chapters]);

  // The chapter this reader last opened.
  // `stats.lastReadChapter` comes from the REAL stats API when it provides it;
  // otherwise we fall back to the newest local progress entry for this comic.
  const lastReadChapterName = stats?.lastReadChapter || localEntry?.lastChapterName || null;

  // Must come after `slug` + `lastReadChapterName` are defined.
  const { chapterProgress } = useReadingProgress(slug, lastReadChapterName);

  useEffect(() => {
    if (!slug) return;
    setLocalEntry(readingProgressService.getMangaProgress(slug));
  }, [slug, mangas.slug]);

  const isComicCompleted = /complete|hoàn thành|finished/i.test(mangas.status || '');

  // Comic-level access roll-up for the "premium chapters available" note.
  const accessSummary = useMemo(
    () =>
      summarise(
        serverData.map((c) => ({ mangaPath: slug, chapter_name: c.chapter_name })),
      ),
    [serverData, slug, summarise],
  );

  // Resume target: LOCAL page progress is the precise source; the history API
  // provides the chapter when we have no local record (e.g. a new device).
  const resumeTarget = useMemo(() => {
    if (!slug) return null;
    const saved = chapterProgress;
    if (saved?.chapterApiData && saved.currentPage > 1 && !saved.completed) {
      return {
        chapterName: saved.chapterName,
        chapterApiData: saved.chapterApiData,
        currentPage: saved.currentPage,
        totalPages: saved.totalPages,
        percent: saved.percent,
        readAt: saved.lastReadAt,
        completed: saved.completed,
      };
    }
    return null;
  }, [chapterProgress, slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) getManga();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      getMangaStats({ mangaPath: slug, userId: userId || undefined }).then(({ data }) => setStats(data?.result ?? null));
      getRatingSummary({ mangaPath: slug, userId: userId || undefined }).then(({ data }) => setRatingSummary(data?.result ?? null));
      getReviews({ mangaPath: slug }).then(({ data }) => setReviews(unwrapList({ data })));
      getRecommendationsMangas({ userId: userId || undefined, limit: 14 }).then(({ data }) => setRecommendationItems(unwrapList({ data })));

      if (userId) {
        getFollowStatus({ userId, mangaPath: slug }).then(({ data }) => setIsFollowing(data?.result ?? false));
        getMyRating({ userId, mangaPath: slug }).then(({ data }) => {
          const mine = data?.result;
          if (mine) {
            setRatingInput(mine.score || 0);
            setReviewText(mine.review || '');
          }
        });
        getCollections({ userId }).then(({ data }) => setCollections(unwrapList({ data })));
      }
    };
    fetchData();
  }, [slug, userId]);

  const getManga = async () => {
    const { data } = await getMangaDetail({ path: slug });
    setManga(data?.result ?? {});
  };

  const encryptText = (text) => btoa(unescape(encodeURIComponent(text)));

  // Handlers
  const handleToggleFollow = async () => {
    if (!userId || followLoading) return;
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowLoading(true);
    try {
      // Rule 3: no `userId` in these write bodies — the JWT identifies the caller.
      if (prev) await unfollowManga({ mangaPath: slug });
      else await followManga({ mangaPath: slug, mangaName: mangas.name, thumbnailUrl: mangas.thumb_url });
    } catch {
      setIsFollowing(prev);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleAddToCollection = async (collectionId) => {
    handleCloseMenu();
    if (!userId || !collectionId || addingToCollection) return;
    setAddingToCollection(true);
    try {
      // Rule 3: no `userId` in this write body.
      await addCollectionItem({
        collectionId,
        mangaPath: slug,
        mangaName: mangas.name,
        thumbnailUrl: mangas.thumb_url,
      });
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userId || ratingInput < 1 || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      // Rule 3: no `userId` in this write body.
      await submitRating({ mangaPath: slug, score: ratingInput, review: reviewText, mangaName: mangas.name, thumbnailUrl: mangas.thumb_url });
      getRatingSummary({ mangaPath: slug, userId }).then(({ data }) => setRatingSummary(data?.result));
      getReviews({ mangaPath: slug }).then(({ data }) => setReviews(unwrapList({ data })));
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className={cx('manga-detail', 'container-fluid')}>
      <div className={cx('wrapper')}>
        {/* --- CỘT TRÁI --- */}
        <div className={cx('left')}>
          <img src={`${IMG_BASE_URL}${mangas.thumb_url}`} alt={mangas.name} className={cx('cover')} />

          <div className={cx('action-group')}>
            <button className={cx('follow-btn', { following: isFollowing })} onClick={handleToggleFollow} disabled={!userId || followLoading}>
              {followLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : isFollowing ? (
                <>
                  <BookmarkAddedRounded /> Đã theo dõi
                </>
              ) : (
                <>
                  <BookmarkAddRounded /> Theo dõi
                </>
              )}
            </button>

            {userId && collections.length > 0 && (
              <>
                <Tooltip title="Lưu vào bộ sưu tập">
                  <button className={cx('collection-trigger')} onClick={handleOpenMenu}>
                    {addingToCollection ? <CircularProgress size={20} color="inherit" /> : <PlaylistAddRounded />}
                  </button>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu} PaperProps={{ className: cx('collection-popover') }}>
                  <div className={cx('menu-title')}>Chọn bộ sưu tập</div>
                  {collections.map((c) => (
                    <MenuItem key={c.id} onClick={() => handleAddToCollection(String(c.id))} className={cx('menu-item')}>
                      <FolderSpecialRounded className={cx('folder-icon')} />
                      {c.collectionName || c.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </div>

          {stats && (
            <div className={cx('stats-grid')}>
              <div className={cx('stat-card')}>
                <PeopleAltRounded /> {stats.totalFollowers || 0}
              </div>
              <div className={cx('stat-card')}>
                <ChatBubbleRounded /> {stats.totalComments || 0}
              </div>
              <div className={cx('stat-card')}>
                <StarRounded /> {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '—'}
              </div>
            </div>
          )}

          <div className={cx('info-box')}>
            <div className={cx('info-row')}>
              <strong>Tình trạng:</strong> <span>{mangas.status}</span>
            </div>
            <div className={cx('info-row')}>
              <strong>Tác giả:</strong> <span>{mangas.author?.join(', ')}</span>
            </div>
            <div className={cx('info-row')}>
              <strong>Cập nhật:</strong> <span>{new Date(mangas.updatedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI (Đã gộp cả Gợi ý và Review vào đây) --- */}
        <div className={cx('right')}>
          <h1 className={cx('manga-title')}>{mangas.name}</h1>
          <div className={cx('tags-row')}>
            {mangas?.category?.map((tag) => (
              <span key={tag.name} className={cx('tag-item')}>
                {tag.name}
              </span>
            ))}
          </div>
          <p className={cx('manga-desc')} dangerouslySetInnerHTML={{ __html: mangas.content }}></p>

          {/* --- RESUME / SMART CONTINUE (P0) --- */}
          {resumeTarget && !resumeTarget.completed && (
            <div className={cx('resume-banner')}>
              <div className={cx('resume-info')}>
                <strong>Bạn đã đọc tới trang {resumeTarget.currentPage}</strong>
                <span>
                  Chương {resumeTarget.chapterName} · {resumeTarget.currentPage}/{resumeTarget.totalPages} ·{' '}
                  {resumeTarget.percent}% {resumeTarget.readAt ? `· ${timeAgo(resumeTarget.readAt)}` : ''}
                </span>
                <div className={cx('resume-track')}>
                  <div className={cx('resume-fill')} style={{ width: `${Math.max(2, resumeTarget.percent)}%` }} />
                </div>
              </div>
              <Link
                to={`${paths.chapterDetail}?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(
                  encodeChapterApiData(resumeTarget.chapterApiData),
                )}&page=${resumeTarget.currentPage}`}
                className={cx('resume-btn')}
              >
                ▶ Tiếp tục đọc
              </Link>
            </div>
          )}

          {/* --- PREMIUM CHAPTERS AVAILABLE (P2) --- */}
          {accessSummary.hasPremium && (
            <div className={cx('premium-note')}>
              💎 Truyện này có <strong>{accessSummary.premiumCount} chương Premium</strong>
              {accessSummary.earlyCount > 0 && ` và ${accessSummary.earlyCount} chương xem trước`} — nâng cấp Premium để
              đọc không giới hạn.
            </div>
          )}

          <div className={cx('chapter-list')}>
            {[...serverData]
              .reverse()
              .slice(5 * (activePage - 1), 5 * activePage)
              .map((chapter, idx) => {
                // serverData is oldest-first, the view is newest-first.
                const realIndex = serverData.length - 1 - (5 * (activePage - 1) + idx);
                const chapterAccess = resolve({
                  mangaPath: slug,
                  chapterName: chapter.chapter_name,
                  index: realIndex,
                  totalChapters: serverData.length,
                  completed: isComicCompleted,
                });
                const target = `${paths.chapterDetail}?id=${encryptText(chapter.chapter_api_data)}&slug=${mangas.slug}`;

                return (
                  <Link
                    key={idx}
                    to={target}
                    onClick={(e) => {
                      if (chapterAccess.canRead) return;
                      e.preventDefault();
                      setGateChapter({ ...chapterAccess, chapterName: chapter.chapter_name, index: realIndex });
                    }}
                    className={cx('chapter-link')}
                  >
                    <div className={cx('chapter-item')}>
                      <div className={cx('ch-main')}>
                        <span className={cx('ch-name')}>Chương {chapter.chapter_name}</span>
                        {chapterAccess.canRead ? null : (
                          <ContentBadge type={chapterAccess.type} price={chapterAccess.price} size="sm" />
                        )}
                        <span className={cx('ch-date')}>{chapter.filename}</span>
                      </div>
                      <DownloadRounded className={cx('dl-icon')} />
                    </div>
                  </Link>
                );
              })}

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                page={activePage}
                count={Math.ceil(serverData.length / 5)}
                onChange={(e, v) => setActivePage(v)}
                sx={{
                  '& .MuiPaginationItem-root': { fontSize: '1.4rem' },
                  '& .MuiPaginationItem-previousNext': { '& svg': { fontSize: '1.4rem', width: '2rem', height: '2rem' } },
                  '& .Mui-selected': { backgroundColor: '#ea982b !important', color: '#fff' },
                }}
              />
            </Stack>
          </div>

          {/* GỢI Ý */}
          <div className={cx('recommend-section')}>
            <h3 className={cx('section-label')}>💡 Gợi ý cho bạn</h3>
            <div className={cx('carousel')}>
              {recommendationItems.slice(0, 6).map((item, idx) => (
                <Link key={idx} to={`${paths.mangaDetail}?slug=${item.slug || item.mangaPath}`} className={cx('rec-card')}>
                  <img src={`${IMG_BASE_URL}${item.thumbnailUrl}`} alt="" />
                  <div className={cx('rec-name')}>{item.name || item.mangaName}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* ĐÁNH GIÁ */}
          <div className={cx('rating-block')}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
              ⭐ ĐÁNH GIÁ TRUYỆN
            </Typography>
            {ratingSummary && (
              <div className={cx('rating-header')}>
                <div className={cx('big-score')}>{Number(ratingSummary.averageScore || 0).toFixed(1)}</div>
                <div className={cx('stars-wrap')}>
                  <div className={cx('stars-row')}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarRounded key={s} sx={{ color: s <= Math.round(ratingSummary.averageScore) ? '#ea982b' : '#eee', fontSize: '2.4rem' }} />
                    ))}
                  </div>
                  <div className={cx('count')}>{ratingSummary.totalRatings || 0} lượt đánh giá</div>
                </div>
              </div>
            )}

            {userId && (
              <div className={cx('rating-form')}>
                <div className={cx('form-title')}>Để lại đánh giá của bạn</div>
                <div className={cx('input-stars')}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarRounded
                      key={s}
                      onClick={() => setRatingInput(s)}
                      sx={{ cursor: 'pointer', fontSize: '3.5rem', color: s <= ratingInput ? '#ea982b' : '#ddd', transition: '0.2s', '&:hover': { transform: 'scale(1.2)' } }}
                    />
                  ))}
                </div>
                <textarea
                  className={cx('review-box')}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Nhận xét của bạn về truyện này..."
                  rows={3}
                />
                <button className={cx('submit-rating')} onClick={handleSubmitRating} disabled={ratingInput < 1 || ratingSubmitting}>
                  {ratingSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                </button>
              </div>
            )}

            {reviews.length > 0 && (
              <div className={cx('reviews-list')}>
                <h3 className={cx('list-title')}>Nhận xét từ cộng đồng ({reviews.length})</h3>
                {reviews.map((r, idx) => (
                  <div key={idx} className={cx('review-item')}>
                    <Avatar className={cx('review-avatar')} src={r.urlImage} />
                    <div className={cx('review-body')}>
                      <div className={cx('review-user-info')}>
                        <div className={cx('user-meta')}>
                          <span className={cx('username')}>{r.userDisplayName || r.name || 'Ẩn danh'}</span>
                          <div className={cx('user-stars')}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <StarRounded key={s} sx={{ fontSize: '1.4rem', color: s <= r.score ? '#ea982b' : '#eee' }} />
                            ))}
                          </div>
                        </div>
                        <span className={cx('review-date')}>{new Date().toLocaleDateString('vi-VN')}</span>
                      </div>
                      {r.review && <p className={cx('review-content')}>{r.review}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PREMIUM GATE: opened from a locked chapter row --- */}
      <PremiumGate
        open={Boolean(gateChapter)}
        onClose={() => setGateChapter(null)}
        mangaPath={slug}
        chapterName={gateChapter?.chapterName}
        chapterIndex={gateChapter?.index}
        totalChapters={serverData.length}
        accessType={gateChapter?.type}
        price={gateChapter?.price}
        onUnlocked={() => {
          const target = gateChapter;
          setGateChapter(null);
          const chapter = serverData.find((c) => c.chapter_name === target?.chapterName);
          if (chapter) {
            window.location.href = `${paths.chapterDetail}?id=${encryptText(chapter.chapter_api_data)}&slug=${slug}`;
          }
        }}
      />
    </div>
  );
};

export default MangaDetail;
