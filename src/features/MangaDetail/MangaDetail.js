import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './MangaDetail.module.scss';
import { getMangaDetail } from '~/services/mangaService';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import paths from '~/routes/paths';
import { useUser } from '~/providers/UserContext';
import { followManga, unfollowManga, getFollowStatus } from '~/services/followService';
import { getMangaStats } from '~/services/statsService';
import { getRatingSummary, getMyRating, getReviews, submitRating } from '~/services/ratingService';
import { getRecommendationsMangas } from '~/services/recommendationService';
import { getCollections, addCollectionItem } from '~/services/collectionService';

const cx = classNames.bind(styles);

const recommendations = [
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-1.png',
    title: 'Hazure Skill "Kage ga...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-2.png',
    title: 'Great Pretender',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-3.png',
    title: 'The General Wants ...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-4.png',
    title: 'In Avatar World Wit...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-5.png',
    title: 'Veiled Armor:...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-6.png',
    title: 'Kimetsu no Yaiba',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-7.png',
    title: 'Ore no Ie ga M...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-1.png',
    title: 'Hazure Skill "Kage ga...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-2.png',
    title: 'Great Pretender',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-3.png',
    title: 'The General Wants ...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-4.png',
    title: 'In Avatar World Wit...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-5.png',
    title: 'Veiled Armor:...',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-6.png',
    title: 'Kimetsu no Yaiba',
  },
  {
    image: 'https://uiparadox.co.uk/templates/animewave/assets/media/shows/show-7.png',
    title: 'Ore no Ie ga M...',
  },
];

const MangaDetail = () => {
  const sliderRef = useRef();
  const [mangas, setManga] = useState([]);
  const [activePage, setActivePage] = useState(1);

  const { userId } = useUser();

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  // Rating
  const [ratingSummary, setRatingSummary] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [recommendationItems, setRecommendationItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [addingToCollection, setAddingToCollection] = useState(false);

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slug = queryParams.get('slug');

  useEffect(() => {
    window.scrollTo(0, 0);
    getManga();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Load stats, follow status, ratings khi slug thay đổi
  useEffect(() => {
    if (!slug) return;
    getMangaStats({ mangaPath: slug, userId: userId || undefined })
      .then((res) => setStats(res?.result))
      .catch(() => {});
    getRatingSummary({ mangaPath: slug, userId: userId || undefined })
      .then((res) => setRatingSummary(res?.result))
      .catch(() => {});
    getReviews({ mangaPath: slug })
      .then((res) => setReviews(res?.result || []))
      .catch(() => {});
    getRecommendationsMangas({ userId: userId || undefined, limit: 14 })
      .then((res) => setRecommendationItems(res?.result || []))
      .catch(() => {});
    if (userId) {
      getFollowStatus({ userId, mangaPath: slug })
        .then((res) => setIsFollowing(res?.result ?? false))
        .catch(() => {});
      getMyRating({ userId, mangaPath: slug })
        .then((res) => {
          const r = res?.result;
          if (r) {
            setMyRating(r);
            setRatingInput(r.score || 0);
            setReviewText(r.review || '');
          }
        })
        .catch(() => {});

      getCollections({ userId })
        .then((res) => {
          const list = res?.result || [];
          setCollections(list);
          if (list.length > 0) {
            setSelectedCollectionId(String(list[0].id || list[0].collectionId));
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, userId]);

  const getManga = async () => {
    const res = await getMangaDetail({ path: slug });
    setManga(res.result);
  };

  const encryptText = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
  };

  const handleToggleFollow = async () => {
    if (!userId || followLoading) return;
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowLoading(true);
    try {
      if (prev) {
        await unfollowManga({ userId, mangaPath: slug });
      } else {
        await followManga({ userId, mangaPath: slug, mangaName: mangas.name, thumbnailUrl: mangas.thumb_url });
      }
    } catch {
      setIsFollowing(prev); // revert
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userId || ratingInput < 1 || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      await submitRating({ userId, mangaPath: slug, score: ratingInput, review: reviewText, mangaName: mangas.name, thumbnailUrl: mangas.thumb_url });
      setMyRating({ score: ratingInput, review: reviewText });
      // Refresh summary
      getRatingSummary({ mangaPath: slug, userId }).then((res) => setRatingSummary(res?.result));
      getReviews({ mangaPath: slug }).then((res) => setReviews(res?.result || []));
    } catch {
      /* handled by interceptor */
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!userId || !selectedCollectionId || !slug || addingToCollection) return;
    setAddingToCollection(true);
    try {
      await addCollectionItem({
        userId,
        collectionId: selectedCollectionId,
        mangaPath: slug,
        mangaName: mangas.name,
        thumbnailUrl: mangas.thumb_url,
      });
    } catch {
      /* toast handled by interceptor */
    } finally {
      setAddingToCollection(false);
    }
  };

  return (
    <div className={cx('manga-detail', 'container-fluid')}>
      <div className={cx('wrapper')}>
        <div className={cx('left')}>
          <img src={`${IMG_BASE_URL}${mangas.thumb_url}`} alt={mangas.name} loading="lazy" className={cx('cover')} />

          <div className={cx('actions')}>
            <button
              className={cx('bookmark', { following: isFollowing })}
              onClick={handleToggleFollow}
              disabled={!userId || followLoading}
              title={!userId ? 'Đăng nhập để theo dõi' : ''}
            >
              {followLoading ? '...' : isFollowing ? '🔖 Đang theo dõi' : '+ Theo dõi'}
            </button>
            {stats && (
              <div className={cx('stats-row')}>
                <span title="Lượt theo dõi">👥 {stats.totalFollowers ?? 0}</span>
                <span title="Bình luận">💬 {stats.totalComments ?? 0}</span>
                <span title="Đánh giá trung bình">⭐ {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '—'}</span>
              </div>
            )}

            {userId && collections.length > 0 && (
              <div className={cx('collection-block')}>
                <label htmlFor="manga-collection-select" className={cx('collection-label')}>
                  Lưu vào bộ sưu tập
                </label>
                <div className={cx('collection-row')}>
                  <select id="manga-collection-select" value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} className={cx('collection-select')}>
                    {collections.map((c) => (
                      <option key={c.id || c.collectionId} value={String(c.id || c.collectionId)}>
                        {c.collectionName || c.name || 'Bộ sưu tập'}
                      </option>
                    ))}
                  </select>
                  <button className={cx('collection-btn')} onClick={handleAddToCollection} disabled={!selectedCollectionId || addingToCollection}>
                    {addingToCollection ? 'Đang thêm...' : 'Thêm vào bộ sưu tập'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={cx('info-table')}>
            <p>
              <strong>Tình trạng</strong> <span>{mangas.status}</span>
            </p>
            <p>
              <strong>Thể loại</strong>{' '}
              <span>
                {mangas?.category?.length <= 2
                  ? mangas?.category?.map((c) => c.name).join(', ')
                  : `${mangas?.category?.[0]?.name} và ${mangas?.category?.length - 1} thể loại khác`}
              </span>
            </p>
            <p>
              <strong>Việt Sub</strong> <span>{mangas.sub_docquyen ? 'Có' : 'Không'}</span>
            </p>
            <p>
              <strong>Tác giả</strong> <span>{mangas.author && mangas.author.map((manga) => manga).join(', ')}</span>
            </p>
            <p>
              <strong>Cập nhật</strong> <span>{new Date(mangas.updatedAt).toLocaleDateString('en-GB')}</span>
            </p>
          </div>
        </div>

        <div className={cx('right')}>
          {/* Phần 1: Tiêu đề và mô tả */}
          <div className={cx('detail-top')}>
            <h1 className={cx('title')}>{mangas.name}</h1>
            <p className={cx('description')} dangerouslySetInnerHTML={{ __html: mangas.content }}></p>
          </div>

          {/* Phần 2: Tags */}
          <div className={cx('tags')}>
            {mangas?.category?.map((tag) => (
              <span key={tag.name} className={cx('tag')}>
                {tag.name}
              </span>
            ))}
          </div>

          {/* Phần 3: Chapters */}
          <div className={cx('chapters')}>
            {[...(mangas.chapters?.[0]?.server_data || [])]
              .reverse()
              .slice(5 * (activePage - 1), 5 * activePage)
              .map((chapter, idx) => (
                <Link to={`${paths.chapterDetail}?id=${encryptText(chapter.chapter_api_data)}&slug=${mangas.slug}`}>
                  <div key={idx} className={cx('chapter')}>
                    <div className={cx('chapter-icon')}>📚</div>
                    <div className={cx('chapter-info')}>
                      <div className={cx('chapter-title')}>Tập {chapter.chapter_name}</div>
                      <div className={cx('chapter-date')}>{chapter.filename}</div>
                    </div>
                    <button className={cx('chapter-download')}>
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                </Link>
              ))}
            <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                page={activePage}
                count={Math.ceil(mangas.chapters?.[0]?.server_data?.length / 5)}
                showFirstButton
                showLastButton
                onChange={(event, value) => {
                  setActivePage(value);
                }}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1.5rem',
                    color: '#000',
                  },
                  '& .Mui-selected': {
                    backgroundColor: '#EA982B !important',
                    color: '#000',
                  },
                }}
              />
            </Stack>
          </div>
        </div>
      </div>

      {/* Phần carousel kéo chuột */}
      <div className={cx('carousel-wrapper')}>
        <h3 className={cx('carousel-title')}>Có thể bạn thích</h3>

        <div
          className={cx('carousel-container')}
          ref={sliderRef}
          onMouseDown={(e) => {
            const slider = sliderRef.current;
            slider.isDown = true;
            slider.startX = e.pageX - slider.offsetLeft;
            e.preventDefault();
          }}
          onMouseLeave={() => {
            const slider = sliderRef.current;
            if (slider) {
              slider.isDown = false;
            }
          }}
          onMouseUp={() => {
            const slider = sliderRef.current;
            if (slider) {
              slider.isDown = false;
            }
          }}
          onMouseMove={(e) => {
            const slider = sliderRef.current;
            if (!slider.isDown) {
              return;
            }
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - slider.startX) * 2; // tốc độ kéo
            slider.scrollLeft -= walk;
          }}
        >
          {(recommendationItems.length > 0 ? recommendationItems : recommendations).map((item, index) => {
            const recSlug = item.slug || item.mangaPath;
            const recTitle = item.name || item.mangaName || item.title;
            const recImage = item.thumb_url ? `${IMG_BASE_URL}${item.thumb_url}` : item.thumbnailUrl || item.image;

            if (recSlug) {
              return (
                <Link key={index} to={`${paths.mangaDetail}?slug=${recSlug}`} className={cx('carousel-item')}>
                  <img src={recImage} alt={recTitle} className={cx('carousel-image')} />
                  <div className={cx('carousel-title-item')}>{recTitle}</div>
                </Link>
              );
            }

            return (
              <div key={index} className={cx('carousel-item')}>
                <img src={recImage} alt={recTitle} className={cx('carousel-image')} />
                <div className={cx('carousel-title-item')}>{recTitle}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phần bình luận */}
      <div className={cx('comments-section')}>
        {/* ── Rating & Reviews ── */}
        <div className={cx('rating-section')}>
          <h2 className={cx('rating-title')}>⭐ Đánh giá truyện</h2>
          {ratingSummary && (
            <div className={cx('rating-summary')}>
              <div className={cx('avg-score')}>{Number(ratingSummary.averageScore || 0).toFixed(1)}</div>
              <div>
                <div className={cx('stars')}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={cx('star', { filled: s <= Math.round(ratingSummary.averageScore) })}>
                      ★
                    </span>
                  ))}
                </div>
                <div className={cx('rating-count')}>{ratingSummary.totalRatings ?? 0} lượt đánh giá</div>
              </div>
            </div>
          )}

          {userId && (
            <div className={cx('my-rating')}>
              <p className={cx('my-rating-label')}>{myRating ? 'Đánh giá của bạn:' : 'Chưa đánh giá — hãy để lại nhận xét:'}</p>
              <div className={cx('star-input')}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} className={cx('star-btn', { filled: s <= ratingInput })} onClick={() => setRatingInput(s)}>
                    ★
                  </button>
                ))}
              </div>
              <textarea className={cx('review-input')} placeholder="Nhận xét của bạn (tuỳ chọn)..." rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              <button className={cx('submit-rating-btn')} onClick={handleSubmitRating} disabled={ratingInput < 1 || ratingSubmitting}>
                {ratingSubmitting ? 'Đang lưu...' : myRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </button>
            </div>
          )}
        </div>

        {/* ── Review list ── */}
        {reviews.length > 0 && (
          <div className={cx('reviews-list')}>
            <h3 className={cx('reviews-heading')}>Nhận xét từ cộng đồng ({reviews.length})</h3>
            {reviews.map((r, idx) => (
              <div key={idx} className={cx('review-item')}>
                <div className={cx('review-header')}>
                  <span className={cx('review-user')}>{r.userDisplayName || r.username}</span>
                  <span className={cx('review-score')}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={cx('star', { filled: s <= r.score })}>
                        ★
                      </span>
                    ))}
                  </span>
                </div>
                {r.review && <p className={cx('review-text')}>{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MangaDetail;
