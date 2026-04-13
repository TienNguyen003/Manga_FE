import { ReplyRounded, DeleteSweepRounded, BlockRounded, FlagRounded, CheckCircleRounded } from '@mui/icons-material';
import { Box, Typography, IconButton, Paper, Avatar, Button, Chip, Stack } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './CommentManagement.module.scss';

const cx = classNames.bind(styles);

export default function CommentManagement() {
  const comments = [
    {
      id: 1,
      user: 'Zoro Lạc Lối',
      content: 'Chap này vẽ hơi ẩu nhé nhóm dịch ơi, xem lại trang 5 bị mất khung hình.',
      time: '2 giờ trước',
      chapter: 'Chap 150',
      replies: [{ id: 11, user: 'Admin Duy', content: 'Cảm ơn bạn đã góp ý, mình sẽ check lại ngay!', time: '1 giờ trước' }],
    },
    {
      id: 2,
      user: 'Trùm Spoil',
      content: 'Thằng chính chuẩn bị chết ở chap sau nè các ông ơi hahaha!',
      time: '5 giờ trước',
      chapter: 'Chap 150',
      isSpam: true,
    },
  ];

  return (
    <div className={cx('commentWrapper')}>
      <Box className={cx('header')}>
        <Typography variant="h5" fontWeight={950}>
          Quản lý Bình luận: Berserk
        </Typography>
        <Typography color="textSecondary">
          Đang xem bình luận tại <b>Chương 150</b>
        </Typography>
      </Box>

      <Stack spacing={2} className={cx('commentList')}>
        {comments.map((comment) => (
          <Paper key={comment.id} className={cx('commentBox', { spam: comment.isSpam })} elevation={0}>
            <Box className={cx('mainComment')}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#0f172a' }}>{comment.user[0]}</Avatar>
              <Box flex={1}>
                <div className={cx('userMeta')}>
                  <Typography className={cx('userName')}>{comment.user}</Typography>
                  <Typography className={cx('time')}>{comment.time}</Typography>
                  {comment.isSpam && <Chip label="Bị báo cáo" size="small" color="error" className={cx('reportBadge')} />}
                </div>
                <Typography className={cx('text')}>{comment.content}</Typography>

                <div className={cx('actions')}>
                  <Button size="small" startIcon={<CheckCircleRounded />}>
                    Duyệt
                  </Button>
                  <Button size="small" startIcon={<ReplyRounded />}>
                    Phản hồi
                  </Button>
                  <Button size="small" startIcon={<BlockRounded />} color="warning">
                    Ban User
                  </Button>
                  <Button size="small" startIcon={<DeleteSweepRounded />} color="error">
                    Xóa
                  </Button>
                </div>
              </Box>
            </Box>

            {/* Render Phản hồi (Replies) */}
            {comment.replies?.map((reply) => (
              <Box key={reply.id} className={cx('replyBox')}>
                <div className={cx('replyLine')} />
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#ea982b' }}>{reply.user[0]}</Avatar>
                <Box>
                  <Typography className={cx('replyUser')}>{reply.user}</Typography>
                  <Typography className={cx('replyText')}>{reply.content}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        ))}
      </Stack>
    </div>
  );
}
