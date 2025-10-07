import { Box, Typography, IconButton, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRef, useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import styles from './Home.module.scss';
import { getMangasByCategory } from '~/services/mangaService';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

const slideHeight = 250;

export default function Banner() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const horizontalRef = useRef(null);
  const [hoverWatch, setHoverWatch] = useState(false);
  const [trailers, setTrailers] = useState([]);

  // Auto scroll horizontal slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (horizontalRef.current) {
        const container = horizontalRef.current;
        const slideWidth = container.clientWidth;
        const maxScrollLeft = container.scrollWidth - slideWidth;
        const currentScroll = container.scrollLeft;

        if (currentScroll >= maxScrollLeft - 1) {
          // Về đầu
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll sang phải
          container.scrollBy({ left: slideWidth, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getManga = async () => {
    const res = await getMangasByCategory({ path: 'adult', page: 1 });
    setTrailers(res.result);
  };

  useEffect(() => {
    getManga();
  }, []);

  return (
    <Box sx={{ width: '100%', p: 2, borderRadius: 4 }} className={cx('container-fluid', 'trailer')}>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Vertical auto-scroll slider */}
        <Box sx={{ width: 320, height: 640, overflow: 'hidden', backgroundColor: '#55555559', p: 2, pb: 0, borderRadius: 5 }}>
          <Box className={cx('trailer-header')}>
            <Box className={cx('left')}>
              <span className={cx('icon')}>
                <img src="https://uiparadox.co.uk/templates/animewave/assets/media/icons/fire-icon.png" alt="Banner" />
              </span>
              <Typography variant="h6" component="span" className={cx('title')}>
                New Trailer
              </Typography>
            </Box>
            <Box className={cx('right')}>
              <span>Short by:</span>
              <span className={cx('highlight')}>Today</span>
              <span>
                <img src="https://uiparadox.co.uk/templates/animewave/assets/media/icons/transfer.png" alt="Banner" />
              </span>
            </Box>
          </Box>

          <Box sx={{ height: 3 * slideHeight, overflow: 'hidden', position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                animation: 'scrollUp 100s linear infinite',
              }}
            >
              {trailers.map((trailer, index) => (
                <Box
                  key={index}
                  sx={{
                    height: slideHeight,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    mb: 3,
                    backgroundImage: `url(${IMG_BASE_URL}${trailer.thumb_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 2,
                      backgroundColor: '#1e1f2080',
                      backdropFilter: 'blur(12.5px)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: '700',
                      p: 2,
                      borderRadius: '0 0 12px 12px',
                      overflow: 'hidden',

                      '&:hover .title_trailer': {
                        color: '#ea982b',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <Link to={`${paths.mangaDetail}?slug=${trailer.slug}`} className={cx('custom-link')}>
                      <Typography
                        variant="body1"
                        className="title_trailer"
                        sx={{
                          maxWidth: 200,
                          fontWeight: 700,
                          fontSize: '16px',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {trailer.name}
                      </Typography>
                    </Link>
                    <IconButton
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.4)',
                        },
                      }}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Horizontal full-screen slider */}
        <Box sx={{ flex: 1, height: 600, position: 'relative' }}>
          {/* Slider container */}
          <Box
            ref={horizontalRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              width: '100%',
              height: 640,
              '& > *': {
                scrollSnapAlign: 'start',
                flex: '0 0 100%',
              },
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {[...trailers, ...trailers].map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundImage: `url(${IMG_BASE_URL}${item.thumb_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {/* Nhãn Trending */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    background: '#B1AEA9',
                    backdropFilter: 'blur(12.5px)',
                    overflow: 'hidden',
                    color: 'white',
                    px: 2.5,
                    py: 1.5,
                    borderRadius: 12,
                    fontSize: '1.6rem',
                    fontWeight: 700,
                  }}
                >
                  🔥 New Trending
                </Typography>

                {/* Overlay đen dưới */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.85))',
                  }}
                />

                {/* Nội dung bên dưới ảnh */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 4,
                    zIndex: 2,
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {/* Tag genres */}
                  <Box sx={{ display: 'flex', gap: 1 }} className={cx('tags-container')}>
                    {['Anime', 'Movies'].map((tag, i) => (
                      <Box
                        key={i}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.75rem',
                          borderRadius: 2,
                          backgroundColor: '#ffffff30',
                          backdropFilter: 'blur(8px)',
                        }}
                        className={cx('tags')}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '55px',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body1" sx={{ maxWidth: 600, opacity: 0.9, fontSize: '18px', mb: 1 }}>
                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
                    excepturi sint...
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Button
                      onMouseEnter={() => setHoverWatch(true)}
                      onMouseLeave={() => setHoverWatch(false)}
                      size="large"
                      sx={{
                        bgcolor: hoverWatch ? 'transparent' : '#f8af3c',
                        border: '1px solid white',
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: 99,
                        fontSize: '15px',
                        px: 3,
                        width: 175,
                        minHeight: 48,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: hoverWatch ? 0 : 1,
                      }}
                    >
                      <PlayArrowIcon
                        sx={{
                          fontSize: '25px',
                          transition: 'all 0.3s ease',
                          transform: hoverWatch ? 'translateX(0)' : 'translateX(0)',
                        }}
                      />

                      <Box
                        component="span"
                        sx={{
                          opacity: hoverWatch ? 0 : 1,
                          transform: hoverWatch ? 'translateX(-10px)' : 'translateX(0)',
                          transition: 'all 0.3s ease',
                          whiteSpace: 'nowrap',
                          ml: hoverWatch ? 0 : 1,
                        }}
                      >
                        Read Now
                      </Box>
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: 99,
                        fontSize: '15px',
                        px: 3,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderColor: 'white',
                        },
                      }}
                      startIcon={
                        <span style={{ fontSize: '15px' }}>
                          <i className="fa-solid fa-download"></i>
                        </span>
                      }
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Scroll animation for vertical slider */}
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-${slideHeight * trailers.length + trailers.length * 8}px); }
        }
      `}</style>
    </Box>
  );
}
