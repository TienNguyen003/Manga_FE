import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CheckCircleRounded, CancelRounded, DeleteSweepRounded, AutoAwesomeRounded, GavelRounded, CategoryRounded, SearchRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import { adminService } from '~/services/adminService';
import styles from './MangaOps.module.scss';

const cx = classNames.bind(styles);

export default function MangaOpsPanel() {
  const [mangas, setMangas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pipeline, reviewModeration] = await Promise.all([adminService.getModerationPipeline(''), adminService.getReviewModeration('')]);

        const pipelineData = pipeline?.result || pipeline?.data || pipeline || {};
        const reviewData = reviewModeration?.result || reviewModeration?.data || reviewModeration || [];

        setMangas(Array.isArray(pipelineData) ? pipelineData : pipelineData.mangas || pipelineData.comics || []);
        setCategories(Array.isArray(pipelineData.categories) ? pipelineData.categories : pipelineData.categories || []);
        setReviews(Array.isArray(reviewData) ? reviewData : reviewData.items || reviewData.reviews || []);
      } catch {
        setMangas([]);
        setCategories([]);
        setReviews([]);
      }
    };

    loadData();
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.toLowerCase();
    return mangas.filter((m) => m.title.toLowerCase().includes(k) || m.id.toLowerCase().includes(k));
  }, [keyword, mangas]);

  const updateStatus = async (id, next) => {
    try {
      await adminService.executeModerationAction({ targetType: 'manga', targetId: id, action: next });
      setMangas((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
      setNotice(`Manga ${id} đã chuyển sang trạng thái: ${next.toUpperCase()}`);
      setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Không thể cập nhật trạng thái manga.');
    }
  };

  return (
    <div className={cx('mangaOpsWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Vận hành nội dung Manga</Typography>
          <Typography className={cx('subTitle')}>Kiểm soát luồng truyện mới, danh mục thể loại và dọn dẹp thảo luận toxic.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AutoAwesomeRounded />} className={cx('aiBtn')}>
          Duyệt tự động bằng AI
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" variant="filled" className={cx('alert')}>
          {notice}
        </Alert>
      )}

      {/* Thanh công cụ lọc nhanh */}
      <Paper className={cx('filterPaper')} elevation={0}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" width="100%">
          <TextField
            fullWidth
            placeholder="Tìm theo mã hoặc tên truyện..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            InputProps={{ startAdornment: <SearchRounded sx={{ mr: 1, color: 'text.secondary' }} /> }}
            className={cx('searchField')}
          />
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Chip label={`Chờ duyệt: ${mangas.filter((m) => m.status === 'pending').length}`} color="warning" className={cx('statChip')} />
            <Chip label={`Flagged: ${mangas.reduce((s, m) => s + m.flagged, 0)}`} color="error" className={cx('statChip')} />
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Hàng chờ duyệt */}
        <Grid item size={{ xs: 12, lg: 8 }}>
          <Paper className={cx('contentPaper')} elevation={0}>
            <Typography className={cx('paperTitle')}>
              <GavelRounded /> Hàng chờ phê duyệt
            </Typography>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell className={cx('headCell')}>Thông tin truyện</TableCell>
                    <TableCell className={cx('headCell')}>Trạng thái</TableCell>
                    <TableCell align="right" className={cx('headCell')}>
                      Thao tác nhanh
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id} className={cx('mangaRow')}>
                      <TableCell>
                        <Typography fontWeight={800}>{m.title || m.name || '-'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {m.id} • {m.category || m.genre || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={m.status === 'pending' ? 'Đang chờ' : 'Hoàn tất'} size="small" className={cx('statusChip', m.status)} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Chấp thuận đăng tải">
                            <IconButton color="success" onClick={() => updateStatus(m.id, 'approved')} className={cx('actionIcon')}>
                              <CheckCircleRounded />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối nội dung">
                            <IconButton color="error" onClick={() => updateStatus(m.id, 'rejected')} className={cx('actionIcon')}>
                              <CancelRounded />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sidebar: Thể loại & Reviews */}
        <Grid item size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Paper className={cx('contentPaper')} elevation={0}>
              <Typography className={cx('paperTitle')}>
                <CategoryRounded /> Quản lý thể loại
              </Typography>
              <Stack spacing={1} mt={2}>
                {categories.map((c) => (
                  <Box key={c.id} className={cx('categoryItem')}>
                    <Box>
                      <Typography fontWeight={700}>{c.name || c.title || '-'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        /{c.slug || c.code || '-'}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="error">
                      <DeleteSweepRounded />
                    </IconButton>
                  </Box>
                ))}
                <Button fullWidth variant="outlined" className={cx('addBtn')}>
                  + Thêm thể loại
                </Button>
              </Stack>
            </Paper>

            <Paper className={cx('contentPaper')} elevation={0}>
              <Typography className={cx('paperTitle')}>Kiểm duyệt Reviews</Typography>
              <Stack spacing={2} mt={2}>
                {reviews.map((r) => (
                  <Box key={r.id} className={cx('reviewCard', { toxic: r.toxic })}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" fontWeight={900}>
                        {r.user || r.username || '-'}
                      </Typography>
                      {r.toxic && <Chip label="Toxic AI" size="small" color="error" variant="filled" sx={{ height: 18, fontSize: '0.65rem' }} />}
                    </Box>
                    <Typography fontSize="1.3rem" mb={1.5}>
                      {r.text || r.content || '-'}
                    </Typography>
                    <Button fullWidth size="small" color="error" variant="contained" className={cx('hideBtn')}>
                      Ẩn thảo luận
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}
