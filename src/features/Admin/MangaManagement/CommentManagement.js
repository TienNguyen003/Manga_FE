import { ReplyRounded, DeleteSweepRounded, BlockRounded, CheckCircleRounded } from '@mui/icons-material';
import { Box, Typography, Paper, Avatar, Button, Chip, Stack } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { unwrapPage } from '~/lib/httpRequest';
import { adminService } from '~/services/adminService';
import styles from './CommentManagement.module.scss';

const cx = classNames.bind(styles);

export default function CommentManagement() {
  // The route's `:id` is a manga id, but the moderation queue is global — the
  // list is filtered server-side by target type, not by this route param.
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      try {
        /*
         * ⚠️ `/admin/mangas/comments` has NO controller server-side, so it always
         * 404s. The only comment moderation surface that exists is the report
         * queue, so this screen reads pending reports on COMMENT targets until
         * the backend ships the moderation endpoints.
         */
        const { data } = await adminService.getReports({ status: 'NEW', page: 0, limit: 50 });
        const { content } = unwrapPage({ data });
        const list = content.filter((r) => r.targetType === 'COMMENT');

        if (cancelled) return;
        setComments(list);
      } catch {
        if (!cancelled) setComments([]);
      }
    };

    loadComments();
    return () => {
      cancelled = true;
    };
  }, []);

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
