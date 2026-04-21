import { ReplyRounded, DeleteSweepRounded, BlockRounded, FlagRounded, CheckCircleRounded } from '@mui/icons-material';
import { Box, Typography, IconButton, Paper, Avatar, Button, Chip, Stack } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '~/services/adminService';
import styles from './CommentManagement.module.scss';

const cx = classNames.bind(styles);

export default function CommentManagement() {
  const { id } = useParams();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await adminService.getCommentModeration('');
        const data = response?.result || response?.data || response || [];
        const list = Array.isArray(data) ? data : data.items || data.comments || [];
        setComments(id ? list.filter((item) => String(item.mangaId || item.comicId || item.id) === String(id) || !item.mangaId) : list);
      } catch {
        setComments([]);
      }
    };

    loadComments();
  }, [id]);

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
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#0f172a' }}>{(comment.user || comment.username || 'U')[0]}</Avatar>
              <Box flex={1}>
                <div className={cx('userMeta')}>
                  <Typography className={cx('userName')}>{comment.user || comment.username || '-'}</Typography>
                  <Typography className={cx('time')}>{comment.time || comment.createdAt || '-'}</Typography>
                  {comment.isSpam && <Chip label="Bị báo cáo" size="small" color="error" className={cx('reportBadge')} />}
                </div>
                <Typography className={cx('text')}>{comment.content || comment.text || '-'}</Typography>

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
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#ea982b' }}>{(reply.user || reply.username || 'U')[0]}</Avatar>
                <Box>
                  <Typography className={cx('replyUser')}>{reply.user || reply.username || '-'}</Typography>
                  <Typography className={cx('replyText')}>{reply.content || reply.text || '-'}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        ))}
      </Stack>
    </div>
  );
}
