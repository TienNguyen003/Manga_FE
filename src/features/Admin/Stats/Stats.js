import { Box, Grid, LinearProgress, Paper, Typography, useTheme } from '@mui/material';
import { ShowChartRounded, PieChartRounded, TrendingUpRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Stats.module.scss';

const cx = classNames.bind(styles);

export default function AdminStats() {
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    const loadCharts = async () => {
      try {
        const response = await adminService.getStatsCharts();
        const data = response?.result || response?.data || response || {};
        setUserRoles(data.userRoles || data.roles || []);
      } catch {
        setUserRoles([]);
      }
    };

    loadCharts();
  }, []);

  return (
    <div className={cx('statsWrapper')}>
      <Grid container spacing={3}>
        {/* --- BIG CHART AREA --- */}
        <Grid item size={{ xs: 12, md: 8 }}>
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
        <Grid item size={{ xs: 12, md: 4 }}>
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
                    <Typography className={cx('roleName')}>{item.role || item.name || '-'}</Typography>
                    <Typography className={cx('roleVal')}>{item.value ?? item.percent ?? 0}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value ?? item.percent ?? 0}
                    className={cx('progBar')}
                    sx={{
                      '& .MuiLinearProgress-bar': { backgroundColor: item.color || '#ea982b' },
                    }}
                  />
                </Box>
              ))}
            </div>

            <Box className={cx('infoBox')}>
              <Typography variant="caption">* Dữ liệu được cập nhật tự động mỗi 15 phút.</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
