import { Box, Grid, LinearProgress, Paper, Typography, useTheme } from '@mui/material';
import { ShowChartRounded, PieChartRounded, TrendingUpRounded } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Stats.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

export default function AdminStats() {
  const [userRoles, setUserRoles] = useState([]);
  const [trend7Days, setTrend7Days] = useState([]);

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      const response = await adminService.getStatsCharts();
      const data = response?.result || {};
      setUserRoles(data.roleDistribution || []);
      setTrend7Days(data.trend7Days || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu thống kê');
    }
  };

  const formattedData = trend7Days.map((i) => ({
    ...i,
    date: new Date(i.date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

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

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formattedData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area dataKey="users" stroke="#4caf50" fill="#c8e6c9" />
                <Area dataKey="posts" stroke="#2196f3" fill="#bbdefb" />
                <Area dataKey="comments" stroke="#ff9800" fill="#ffe0b2" />
              </AreaChart>
            </ResponsiveContainer>
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
              {Object.entries(userRoles).map(([role, count]) => (
                <Box key={role} className={cx('progressItem')}>
                  <Box className={cx('labelRow')}>
                    <Typography className={cx('roleName')}>{role || '-'}</Typography>
                    <Typography className={cx('roleVal')}>{count || 0}</Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={count || 0}
                    className={cx('progBar')}
                    sx={{
                      backgroundColor: '#e3f2fd', // nền nhạt

                      '& .MuiLinearProgress-bar': {
                        backgroundColor: role === 'Admin' ? '#ea982b' : role === 'Member' ? '#4caf50' : '#64b5f6', // xanh nhạt hơn mặc định
                      },
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
