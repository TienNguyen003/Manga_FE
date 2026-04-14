import { 
  AddRounded, AdsClickRounded, DeleteOutlineRounded, EditRounded, 
  PauseCircleOutlineRounded, PlayCircleOutlineRounded, VisibilityRounded, 
  MoreHorizRounded, TrendingUpRounded 
} from '@mui/icons-material';
import { Box, Button, Chip, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Ads.module.scss';

const cx = classNames.bind(styles);

export default function AdsManagement() {
  const ads = [
    { id: 1, name: 'Banner Trang Chủ - Summer Sale', position: 'Header Main', status: 'Active', clicks: 1240, views: '15.2k', ctr: '8.2%', type: 'Image' },
    { id: 2, name: 'Quảng cáo giữa chương - Game Mobile', position: 'Manga Content', status: 'Paused', clicks: 850, views: '45.1k', ctr: '1.8%', type: 'Video' },
    { id: 3, name: 'Sidebar - Khóa học React', position: 'Sidebar Left', status: 'Expired', clicks: 320, views: '5.4k', ctr: '5.9%', type: 'Image' },
  ];

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Quản lý Quảng cáo</Typography>
          <Typography className={cx('subtitle')}>Theo dõi hiệu suất và tối ưu hóa doanh thu chiến dịch.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('addBtn')}>
          Chiến dịch mới
        </Button>
      </header>

      {/* --- STATS GRID (Bento Style) --- */}
      <Grid container spacing={3} className={cx('statsGrid')}>
        {[
          { lbl: 'Lượt Click', val: '2,540', icon: <AdsClickRounded />, color: '#3b82f6' },
          { lbl: 'Hiển thị', val: '120.4k', icon: <VisibilityRounded />, color: '#10b981' },
          { lbl: 'CTR Trung bình', val: '4.8%', icon: <TrendingUpRounded />, color: '#ea982b' }
        ].map((s, i) => (
          <Grid item size={{ xs: 12, sm: 4 }} key={i}>
            <Paper className={cx('statCard')} elevation={0}>
              <div className={cx('iconBox')} style={{ color: s.color, backgroundColor: `${s.color}15` }}>{s.icon}</div>
              <Box>
                <Typography className={cx('statVal')}>{s.val}</Typography>
                <Typography className={cx('statLbl')}>{s.lbl}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* --- TABLE AREA --- */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>CHIẾN DỊCH / VỊ TRÍ</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>LOẠI</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>HIỆU SUẤT (CLICKS/VIEWS)</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>CTR</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>TRẠNG THÁI</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id} className={cx('tableRow')}>
                <TableCell>
                  <Typography className={cx('adName')}>{ad.name}</Typography>
                  <Typography className={cx('adPos')}>{ad.position}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={ad.type} size="small" className={cx('typeChip')} />
                </TableCell>
                <TableCell>
                  <Box className={cx('perfBox')}>
                    <Typography><b>{ad.clicks}</b> <small>clicks</small></Typography>
                    <Typography color="textSecondary"><b>{ad.views}</b> <small>views</small></Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography fontWeight={700} color="#ea982b">{ad.ctr}</Typography></TableCell>
                <TableCell>
                  <div className={cx('statusTag', ad.status.toLowerCase())}>
                    <span className={cx('dot')} />
                    {ad.status}
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div className={cx('actions')}>
                    <Tooltip title={ad.status === 'Paused' ? 'Tiếp tục' : 'Tạm dừng'}>
                      <IconButton size="small" className={cx('actionBtn')}>
                        {ad.status === 'Paused' ? <PlayCircleOutlineRounded color="success" /> : <PauseCircleOutlineRounded />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" className={cx('actionBtn')}><EditRounded /></IconButton>
                    <IconButton size="small" className={cx('actionBtn', 'delete')}><DeleteOutlineRounded /></IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}