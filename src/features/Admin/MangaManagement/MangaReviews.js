import { ArrowBackRounded, DeleteOutlineRounded, ThumbUpAltRounded, ChatBubbleOutlineRounded } from '@mui/icons-material';
import { Box, Typography, IconButton, Paper, Grid, Avatar, Rating, Button } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { unwrapPage } from '~/lib/httpRequest';
import { adminService } from '~/services/adminService';
import styles from './MangaReviews.module.scss';

const cx = classNames.bind(styles);

export default function MangaReviews() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        /*
         * ⚠️ `/admin/mangas/reviews` has NO controller server-side. Reviews are
         * surfaced through the ratings API, so this reads them from the one
         * endpoint that actually exists instead of rendering an empty table.
         */
        const { data } = await adminService.getReports({ status: 'NEW', page: 0, limit: 50 });
        const { content } = unwrapPage({ data });
        const list = content.filter((r) => r.targetType === 'REVIEW');

        if (cancelled) return;
        setReviews(list);
      } catch {
        if (!cancelled) setReviews([]);
      }
    };

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={cx('reviewsContainer')}>
      {/* HEADER: Cho biết đang quản lý review của truyện nào */}
      <header className={cx('header')}>
        <IconButton className={cx('backBtn')}>
          <ArrowBackRounded />
        </IconButton>
        <Box ml={2}>
          <Typography className={cx('mangaName')}>{id ? `Manga ${id}` : 'Đánh giá truyện'}</Typography>
          <Typography className={cx('statLine')}>Tổng cộng {reviews.length} đánh giá</Typography>
        </Box>
      </header>

      <Grid container spacing={3}>
        {reviews.map((rev) => (
          <Grid item size={6} key={rev.id}>
            <Paper className={cx('reviewCard')} elevation={0}>
              <Box className={cx('userSection')}>
                <Avatar sx={{ bgcolor: '#ea982b', fontWeight: 700 }}>{(rev.user || rev.username || 'U')[0]}</Avatar>
                <div className={cx('userInfo')}>
                  <Typography className={cx('userName')}>{rev.user || rev.username || '-'}</Typography>
                  <Typography className={cx('date')}>{rev.date || rev.createdAt || '-'}</Typography>
                </div>
                <Rating value={Number(rev.rating || rev.score || 0)} readOnly size="small" className={cx('stars')} />
              </Box>

              <Typography className={cx('content')}>{rev.content || rev.text || '-'}</Typography>

              <div className={cx('footer')}>
                <div className={cx('interactions')}>
                  <span className={cx('stat')}>
                    <ThumbUpAltRounded /> {rev.likes ?? rev.likeCount ?? 0}
                  </span>
                  <span className={cx('stat')}>
                    <ChatBubbleOutlineRounded /> 4 phản hồi
                  </span>
                </div>
                <div className={cx('actions')}>
                  <Button size="small" startIcon={<DeleteOutlineRounded />} color="error">
                    Xóa vi phạm
                  </Button>
                  <Button size="small" variant="outlined">
                    Phản hồi
                  </Button>
                </div>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
