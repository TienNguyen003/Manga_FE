import { AutoFixHighRounded, PushPinRounded, SecurityRounded, SyncRounded, TrendingUpRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Divider, Grid, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import styles from './Recommendation.module.scss';

const cx = classNames.bind(styles);

const seed = [
  { manga: 'Huyết Kiếm', impressions: 22000, ctr: '8.2%', score: 0.91, pinned: false },
  { manga: 'Mặt Trăng Đỏ', impressions: 18200, ctr: '5.1%', score: 0.77, pinned: true },
  { manga: 'Hoa Đăng', impressions: 41000, ctr: '2.3%', score: 0.45, pinned: false },
];

export default function RecommendationControlPanel() {
  const [rows, setRows] = useState(seed);
  const [notice, setNotice] = useState('');
  const [biasGuard, setBiasGuard] = useState(true);

  const togglePin = (manga) => {
    setRows((prev) => prev.map((r) => (r.manga === manga ? { ...r, pinned: !r.pinned } : r)));
    setNotice(`Đã cập nhật trạng thái ghim cho ${manga}.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const overrideScore = (manga) => {
    setRows((prev) => prev.map((r) => (r.manga === manga ? { ...r, score: Math.min(0.99, r.score + 0.1) } : r)));
    setNotice(`Đã override điểm ưu tiên cho ${manga}.`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className={cx('controlWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Điều khiển Đề xuất</Typography>
          <Typography className={cx('subTitle')}>Can thiệp thuật toán, ghim nội dung và kiểm soát Bias (Thiên lệch).</Typography>
        </Box>
        <Button variant="contained" startIcon={<SyncRounded />} className={cx('syncBtn')}>
          Làm mới dữ liệu
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" className={cx('alert')} icon={<AutoFixHighRounded />}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Bảng điều khiển chính */}
        <Grid item size={{ xs: 12, sm: 8 }}>
          <Paper className={cx('mainPaper')} elevation={0}>
            <div className={cx('paperHeader')}>
              <Typography className={cx('paperTitle')}>
                <TrendingUpRounded /> Top hiển thị hệ thống
              </Typography>
            </div>
            <TableContainer className={cx('tableContainer')}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell className={cx('headCell')}>Manga</TableCell>
                    <TableCell className={cx('headCell')}>Lượt hiển thị</TableCell>
                    <TableCell className={cx('headCell')}>CTR</TableCell>
                    <TableCell className={cx('headCell')}>Điểm AI</TableCell>
                    <TableCell className={cx('headCell')} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.manga} className={cx('tableRow', { pinned: r.pinned })}>
                      <TableCell className={cx('mangaCell')}>
                        {r.pinned && <PushPinRounded className={cx('pinIcon')} />}
                        {r.manga}
                      </TableCell>
                      <TableCell className={cx('statCell')}>{r.impressions.toLocaleString()}</TableCell>
                      <TableCell className={cx('ctrCell')}>
                        <span className={cx('badge')}>{r.ctr}</span>
                      </TableCell>
                      <TableCell className={cx('scoreCell')}>
                        <Typography fontWeight={900} color={r.score > 0.8 ? 'primary' : 'inherit'}>
                          {r.score.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={r.pinned ? 'Bỏ ghim' : 'Ghim lên đầu Feed'}>
                            <IconButton onClick={() => togglePin(r.manga)} className={cx('actionBtn', { active: r.pinned })}>
                              <PushPinRounded />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tăng điểm ưu tiên (+0.1)">
                            <IconButton color="warning" onClick={() => overrideScore(r.manga)} className={cx('actionBtn')}>
                              <AutoFixHighRounded />
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

        {/* Cột cài đặt bên phải */}
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Stack spacing={3}>
            <Paper className={cx('sidePaper')} elevation={0}>
              <Box className={cx('sideHeader')}>
                <SecurityRounded color="primary" />
                <Typography fontWeight={800} ml={1}>
                  Giám sát thiên lệch
                </Typography>
              </Box>
              <Typography className={cx('sideDesc')}>Tự động điều chỉnh nếu một thể loại chiếm {'>'} 40% trang chủ.</Typography>

              <div className={cx('biasControl')}>
                <Typography fontWeight={700}>Bảo vệ thuật toán</Typography>
                <Switch checked={biasGuard} onChange={(e) => setBiasGuard(e.target.checked)} color="primary" />
              </div>

              <Divider className={cx('divider')} />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Hành động 42%" className={cx('biasChip', 'warning')} />
                <Chip label="Lãng mạn 15%" className={cx('biasChip', 'info')} />
                <Chip label="Kinh dị 5%" className={cx('biasChip', 'error')} />
              </Stack>
            </Paper>

            <Paper className={cx('sidePaper', 'actionCard')} elevation={0}>
              <Typography fontWeight={800} mb={1}>
                Đẩy cấu hình thủ công
              </Typography>
              <Typography className={cx('sideDesc')} mb={2}>
                Áp dụng mọi thay đổi vào API /recommendations ngay lập tức.
              </Typography>
              <Button fullWidth variant="contained" className={cx('applyBtn')}>
                Đồng bộ Feed ngay
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}
