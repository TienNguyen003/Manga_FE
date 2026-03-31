import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Pagination, Stack, Menu, MenuItem, Tooltip, CircularProgress, Typography } from '@mui/material';
import {
  PlaylistAddRounded,
  BookmarkAddedRounded,
  BookmarkAddRounded,
  FolderSpecialRounded,
  DownloadRounded,
  StarRounded,
  ChatBubbleRounded,
  PeopleAltRounded,
} from '@mui/icons-material';

import { useUser } from '~/providers/UserContext';
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
  const [myRating, setMyRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [recommendationItems, setRecommendationItems] = useState([]);

  // Collection Menu State
  const [collections, setCollections] = useState([]);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const location = useLocation();
  const slug = new URLSearchParams(location.search).get('slug');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) getManga();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      getMangaStats({ mangaPath: slug, userId: userId || undefined }).then((res) => setStats(res?.result));
      getRatingSummary({ mangaPath: slug, userId: userId || undefined }).then((res) => setRatingSummary(res?.result));
      getReviews({ mangaPath: slug }).then((res) => setReviews(res?.result || []));
      getRecommendationsMangas({ userId: userId || undefined, limit: 14 }).then((res) => setRecommendationItems(res?.result || []));

      if (userId) {
        getFollowStatus({ userId, mangaPath: slug }).then((res) => setIsFollowing(res?.result ?? false));
        getMyRating({ userId, mangaPath: slug }).then((res) => {
          if (res?.result) {
            setMyRating(res.result);
            setRatingInput(res.result.score || 0);
            setReviewText(res.result.review || '');
          }
        });
        getCollections({ userId }).then((res) => setCollections(res?.result || []));
      }
    };
    fetchData();
  }, [slug, userId]);

  const getManga = async () => {
    const res = await getMangaDetail({ path: slug });
    setManga(res.result);
  };

  const encryptText = (text) => btoa(unescape(encodeURIComponent(text)));

  // Handlers
  const handleToggleFollow = async () => {
    if (!userId || followLoading) return;
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowLoading(true);
    try {
      if (prev) await unfollowManga({ userId, mangaPath: slug });
      else await followManga({ userId, mangaPath: slug, mangaName: mangas.name, thumbnailUrl: mangas.thumb_url });
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
      await addCollectionItem({
        userId,
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
      await submitRating({ userId, mangaPath: slug, score: ratingInput, review: reviewText, mangaName: mangas.name, thumbnailUrl: mangas.thumb_url });
      setMyRating({ score: ratingInput, review: reviewText });
      getRatingSummary({ mangaPath: slug, userId }).then((res) => setRatingSummary(res?.result));
      getReviews({ mangaPath: slug }).then((res) => setReviews(res?.result || []));
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className={cx('manga-detail', 'container-fluid')}>
      <div className={cx('wrapper')}>
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

          <div className={cx('chapter-list')}>
            {[...(mangas.chapters?.[0]?.server_data || [])]
              .reverse()
              .slice(5 * (activePage - 1), 5 * activePage)
              .map((chapter, idx) => (
                <Link key={idx} to={`${paths.chapterDetail}?id=${encryptText(chapter.chapter_api_data)}&slug=${mangas.slug}`} className={cx('chapter-link')}>
                  <div className={cx('chapter-item')}>
                    <div className={cx('ch-main')}>
                      <span className={cx('ch-name')}>Chương {chapter.chapter_name}</span>
                      <span className={cx('ch-date')}>{chapter.filename}</span>
                    </div>
                    <DownloadRounded className={cx('dl-icon')} />
                  </div>
                </Link>
              ))}

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                page={activePage}
                count={Math.ceil(mangas.chapters?.[0]?.server_data?.length / 5)}
                onChange={(e, v) => setActivePage(v)}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1.4rem',
                  },
                  '& .MuiPaginationItem-previousNext': {
                    '& svg': {
                      fontSize: '1.4rem',
                      width: '2rem',
                      height: '2rem',
                    },
                  },
                  '& .Mui-selected': { backgroundColor: '#ea982b !important', color: '#fff' },
                }}
              />
            </Stack>
          </div>
        </div>
      </div>

      {/* Gợi ý */}
      <div className={cx('recommend-section')}>
        <h3 className={cx('section-label')}>Gợi ý cho bạn</h3>
        <div
          className={cx('carousel')}
        >
          {recommendationItems.slice(0, 6).map((item, idx) => (
            <Link key={idx} to={`${paths.mangaDetail}?slug=${item.slug || item.mangaPath}`} className={cx('rec-card')}>
              <img src={`${IMG_BASE_URL}${item.thumbnailUrl}`} alt="" />
              <div className={cx('rec-name')}>{item.name || item.mangaName}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Đánh giá */}
      <div className={cx('rating-block')}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
          ⭐ ĐÁNH GIÁ
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
            <div className={cx('input-stars')}>
              {[1, 2, 3, 4, 5].map((s) => (
                <StarRounded key={s} onClick={() => setRatingInput(s)} sx={{ cursor: 'pointer', fontSize: '4rem', color: s <= ratingInput ? '#ea982b' : '#ddd' }} />
              ))}
            </div>
            <textarea className={cx('review-box')} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Nhận xét của bạn..." rows={3} />
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
                <div className={cx('review-user-info')}>
                  <div className={cx('user-meta')}>
                    <span className={cx('username')}>{r.userDisplayName || r.username}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MangaDetail;
