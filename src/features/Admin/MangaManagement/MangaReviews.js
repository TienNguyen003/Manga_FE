import { ArrowBackRounded, StarRounded, DeleteOutlineRounded, ThumbUpAltRounded, ChatBubbleOutlineRounded } from '@mui/icons-material';
import { Box, Typography, IconButton, Paper, Grid, Avatar, Rating, Button, Divider } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './MangaReviews.module.scss';

const cx = classNames.bind(styles);

export default function MangaReviews() {
  const reviews = [
    { id: 1, user: 'Hoàng Long', rating: 5, content: 'Cốt truyện đỉnh cao, nét vẽ Berserk thì khỏi bàn rồi. Mong nhóm dịch tiếp tục cố gắng!', date: '12/04/2026', likes: 24 },
    { id: 2, user: 'MangaFan99', rating: 4, content: 'Truyện hay nhưng thỉnh thoảng font chữ hơi khó đọc ở các chap cũ.', date: '10/04/2026', likes: 12 },
    { id: 3, user: 'MangaFan99', rating: 4, content: 'Truyện hay nhưng thỉnh thoảng font chữ hơi khó đọc ở các chap cũ.', date: '10/04/2026', likes: 12 },
    { id: 4, user: 'MangaFan99', rating: 4, content: 'Cốt truyện đỉnh cao, nét vẽ Berserk thì khỏi bàn rồi. Mong nhóm dịch tiếp tục cố gắng!', date: '10/04/2026', likes: 12 },
  ];

  return (
    <div className={cx('reviewsContainer')}>
      {/* HEADER: Cho biết đang quản lý review của truyện nào */}
      <header className={cx('header')}>
        <IconButton className={cx('backBtn')}>
          <ArrowBackRounded />
        </IconButton>
        <Box ml={2}>
          <Typography className={cx('mangaName')}>Berserk (1997)</Typography>
          <Typography className={cx('statLine')}>Tổng cộng 128 đánh giá • Điểm trung bình: 4.8/5</Typography>
        </Box>
      </header>

      <Grid container spacing={3}>
        {reviews.map((rev) => (
          <Grid item size={6} key={rev.id}>
            <Paper className={cx('reviewCard')} elevation={0}>
              <Box className={cx('userSection')}>
                <Avatar sx={{ bgcolor: '#ea982b', fontWeight: 700 }}>{rev.user[0]}</Avatar>
                <div className={cx('userInfo')}>
                  <Typography className={cx('userName')}>{rev.user}</Typography>
                  <Typography className={cx('date')}>{rev.date}</Typography>
                </div>
                <Rating value={rev.rating} readOnly size="small" className={cx('stars')} />
              </Box>

              <Typography className={cx('content')}>{rev.content}</Typography>

              <div className={cx('footer')}>
                <div className={cx('interactions')}>
                  <span className={cx('stat')}>
                    <ThumbUpAltRounded /> {rev.likes}
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
