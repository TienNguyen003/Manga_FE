import { GroupsRounded, InsightsRounded, MenuBookRounded, SpeedRounded, TrendingUpRounded, WhatshotRounded } from '@mui/icons-material';
import { Box, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Ops.module.scss';

const cx = classNames.bind(styles);

const kpis = [
  { label: 'DAU', value: '18,420', trend: '+12%', tone: 'success', icon: <GroupsRounded /> },
  { label: 'MAU', value: '204,110', trend: '+5.2%', tone: 'info', icon: <InsightsRounded /> },
  { label: 'Tỷ lệ báo cáo', value: '2.8%', trend: '-0.4%', tone: 'warning', icon: <SpeedRounded /> },
  { label: 'Thời gian đọc TB', value: '26m', trend: '+2m', tone: 'primary', icon: <MenuBookRounded /> },
];

export default function OpsMonitoringPanel() {
  return (
    <div className={cx('opsWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Giám sát vận hành</Typography>
          <Typography className={cx('subTitle')}>Tổng hợp các chỉ số tương tác, tăng trưởng và sức khỏe cộng đồng.</Typography>
        </Box>
        <Chip icon={<WhatshotRounded />} label="Live: 1,204 users online" className={cx('liveBadge')} />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {kpis.map((k) => (
          <Grid item size={{ xs: 6, sm: 3 }} key={k.label}>
            <Paper className={cx('kpiCard', k.tone)} elevation={0}>
              <Box className={cx('cardTop')}>
                <div className={cx('iconBox')}>{k.icon}</div>
                <Typography className={cx('trendText')}>{k.trend}</Typography>
              </Box>
              <Typography className={cx('kpiLabel')}>{k.label}</Typography>
              <Typography className={cx('kpiValue')}>{k.value}</Typography>
              <LinearProgress variant="determinate" value={70} className={cx('progress')} color="inherit" />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Manga nổi bật */}
        <Grid item size={{ xs: 12, lg: 6 }}>
          <Paper className={cx('listPaper')} elevation={0}>
            <Box className={cx('paperHeader')}>
              <WhatshotRounded color="error" />
              <Typography fontWeight={800} ml={1}>
                Manga nổi bật nhất
              </Typography>
            </Box>
            <Stack spacing={2} p={3}>
              {[
                { name: 'Huyết Kiếm', views: '52,400', color: '#f59e0b' },
                { name: 'Mặt Trăng Đỏ', views: '44,120', color: '#3b82f6' },
                { name: 'Hoa Đăng', views: '36,000', color: '#10b981' },
              ].map((m, index) => (
                <Box key={m.name} className={cx('mangaItem')}>
                  <Typography className={cx('rank')}>#{index + 1}</Typography>
                  <Box flex={1}>
                    <Typography fontWeight={800}>{m.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {m.views} lượt xem/ngày
                    </Typography>
                  </Box>
                  <TrendingUpRounded style={{ color: m.color }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Nhiệt cộng đồng */}
        <Grid item size={{ xs: 12, lg: 6 }}>
          <Paper className={cx('listPaper')} elevation={0}>
            <Box className={cx('paperHeader')}>
              <TrendingUpRounded color="primary" />
              <Typography fontWeight={800} ml={1}>
                Tần suất hoạt động (24h)
              </Typography>
            </Box>
            <Stack spacing={3} p={3}>
              <Box className={cx('metricBox')}>
                <Typography>Bài viết mới</Typography>
                <Typography className={cx('metricValue')}>420</Typography>
                <LinearProgress variant="determinate" value={45} className={cx('metricBar', 'post')} />
              </Box>
              <Box className={cx('metricBox')}>
                <Typography>Bình luận mới</Typography>
                <Typography className={cx('metricValue')}>4,800</Typography>
                <LinearProgress variant="determinate" value={85} className={cx('metricBar', 'comment')} />
              </Box>
              <Box className={cx('metricBox')}>
                <Typography>Báo cáo xử lý</Typography>
                <Typography className={cx('metricValue')}>71</Typography>
                <LinearProgress variant="determinate" value={20} className={cx('metricBar', 'report')} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
