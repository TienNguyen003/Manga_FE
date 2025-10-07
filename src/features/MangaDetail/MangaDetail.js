import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './MangaDetail.module.scss';
import { getMangaDetail } from '~/services/mangaService';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import paths from '~/routes/paths';

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

const commentsData = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    time: '5 minutes ago',
    content: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.',
  },
  {
    id: 2,
    user: {
      name: 'Jane Smith',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    time: '10 minutes ago',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  },
];

const MangaDetail = () => {
  const sliderRef = useRef();
  const commentRef = useRef();
  const [mangas, setManga] = useState([]);
  const [activePage, setActivePage] = useState(1);

  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slug = queryParams.get('slug');

  useEffect(() => {
    window.scrollTo(0, 0);
    getManga();
  }, [slug]);

  const getManga = async () => {
    const res = await getMangaDetail({ path: slug });
    setManga(res.result);
  };

  const encryptText = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
  };

  return (
    <div className={cx('manga-detail', 'container-fluid')}>
      <div className={cx('wrapper')}>
        <div className={cx('left')}>
          <img src={`${IMG_BASE_URL}${mangas.thumb_url}`} alt={mangas.name} loading="lazy" className={cx('cover')} />

          <div className={cx('actions')}>
            <button className={cx('bookmark')}>BOOKMARKED</button>
            <button className={cx('download')}>DOWNLOAD</button>
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
          {recommendations.map((item, index) => (
            <div key={index} className={cx('carousel-item')}>
              <img src={item.image} alt={item.title} className={cx('carousel-image')} />
              <div className={cx('carousel-title-item')}>{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phần bình luận */}
      <div className={cx('comments-section')}>
        <h2 className={cx('comments-title')}>COMMENTS</h2>
        <p className={cx('comments-subtitle')}>
          We hope you have a good time bro using the comment section! Please read our <span className={cx('comment-policy')}>Comment Policy</span> before commenting.
        </p>
        <h3 className={cx('comments-count')}>300 Comments</h3>

        {/* Input viết comment */}
        <div className={cx('comment-input-wrapper')}>
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="user avatar" className={cx('comment-avatar')} />
          <input ref={commentRef} type="text" placeholder="Write a Comment" className={cx('comment-input')} />
          <button className={cx('comment-post-btn')}>Post</button>
        </div>

        {/* Danh sách comment */}
        <div className={cx('comments-list')}>
          {commentsData.map((comment) => (
            <div key={comment.id} className={cx('comment-item')}>
              <img src={comment.user.avatar} alt={`${comment.user.name} avatar`} className={cx('comment-avatar')} />
              <div className={cx('comment-content')}>
                <div className={cx('comment-header')}>
                  <span className={cx('comment-username')}>@{comment.user.name}</span>
                  <span className={cx('comment-time')}>{comment.time}</span>
                </div>
                <p>{comment.content}</p>

                <div className={cx('comment-actions')}>
                  <button className={cx('like-btn')}>👍</button>
                  <button className={cx('dislike-btn')}>👎</button>
                  <button className={cx('reply-btn')}>Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;
