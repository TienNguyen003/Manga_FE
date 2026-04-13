import { Box, Grid, LinearProgress, Paper, Typography, useTheme } from '@mui/material';
import { ShowChartRounded, PieChartRounded, TrendingUpRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import styles from './Stats.module.scss';

const cx = classNames.bind(styles);

export default function AdminStats() {
  const userRoles = [
    { role: 'Thành viên', value: 80, color: '#ea982b' }, // Màu chủ đạo của mày
    { role: 'Tác giả', value: 45, color: '#3b82f6' },
    { role: 'Dịch giả', value: 25, color: '#10b981' },
    { role: 'Admin', value: 10, color: '#ef4444' },
  ];

  return (
    <div className={cx('statsWrapper')}>
      <Grid container spacing={3}>
        {/* --- BIG CHART AREA --- */}
        <Grid item xs={12} md={8} sx={{flex: 1}}>
          <Paper className={cx('chartTile')} elevation={0}>
            <header className={cx('tileHeader')}>
              <Box>
                <Typography className={cx('title')}>Lưu lượng truy cập</Typography>
                <Typography className={cx('subtitle')}>Dữ liệu tổng hợp trong 30 ngày qua</Typography>
              </Box>
              <div className={cx('iconBox')}>
                <ShowChartRounded />
              </div>
            </header>
            
            <div className={cx('chartPlaceholder')}>
              <div className={cx('visualIcon')}>
                <TrendingUpRounded />
              </div>
              <Typography color="textSecondary" fontWeight={600}>
                Area Chart Ready to Inject
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* --- USER DISTRIBUTION AREA --- */}
        <Grid item xs={12} md={4}>
          <Paper className={cx('chartTile')} elevation={0}>
            <header className={cx('tileHeader')}>
              <Box>
                <Typography className={cx('title')}>Phân bố người dùng</Typography>
                <Typography className={cx('subtitle')}>Tỷ lệ vai trò trong hệ thống</Typography>
              </Box>
              <div className={cx('iconBox', 'pie')}>
                <PieChartRounded />
              </div>
            </header>

            <div className={cx('progressList')}>
              {userRoles.map((item, idx) => (
                <Box key={idx} className={cx('progressItem')}>
                  <Box className={cx('labelRow')}>
                    <Typography className={cx('roleName')}>{item.role}</Typography>
                    <Typography className={cx('roleVal')}>{item.value}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.value} 
                    className={cx('progBar')}
                    sx={{
                      '& .MuiLinearProgress-bar': { backgroundColor: item.color }
                    }}
                  />
                </Box>
              ))}
            </div>

            <Box className={cx('infoBox')}>
              <Typography variant="caption">
                * Dữ liệu được cập nhật tự động mỗi 15 phút.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}