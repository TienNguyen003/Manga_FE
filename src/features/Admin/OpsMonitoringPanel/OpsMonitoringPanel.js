import { GroupsRounded, InsightsRounded, MenuBookRounded, SpeedRounded, TrendingUpRounded, WhatshotRounded } from '@mui/icons-material';
import { Box, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Ops.module.scss';

const cx = classNames.bind(styles);

export default function OpsMonitoringPanel() {
  const [kpis, setKpis] = useState([]);
  const [topMangas, setTopMangas] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await adminService.getOpsMetrics();
        const data = response?.result || response?.data || response || {};
        setKpis(data.kpis || data.metrics || []);
        setTopMangas(data.topMangas || data.mangas || []);
        setActivities(data.activity || data.activities || []);
      } catch {
        setKpis([]);
        setTopMangas([]);
        setActivities([]);
      }
    };

    loadMetrics();
  }, []);

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
        {kpis.map((k, index) => (
          <Grid item size={{ xs: 6, sm: 3 }} key={k.label}>
            <Paper className={cx('kpiCard', k.tone)} elevation={0}>
              <Box className={cx('cardTop')}>
                <div className={cx('iconBox')}>{k.icon || [<GroupsRounded />, <InsightsRounded />, <SpeedRounded />, <MenuBookRounded />][index % 4]}</div>
                <Typography className={cx('trendText')}>{k.trend || k.change || '0%'}</Typography>
              </Box>
              <Typography className={cx('kpiLabel')}>{k.label || k.name || '-'}</Typography>
              <Typography className={cx('kpiValue')}>{k.value || k.count || '0'}</Typography>
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
              {topMangas.map((m, index) => (
                <Box key={m.name} className={cx('mangaItem')}>
                  <Typography className={cx('rank')}>#{index + 1}</Typography>
                  <Box flex={1}>
                    <Typography fontWeight={800}>{m.name || m.title || '-'}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {m.views || m.viewCount || 0} lượt xem/ngày
                    </Typography>
                  </Box>
                  <TrendingUpRounded style={{ color: m.color || '#ea982b' }} />
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
              {activities.length ? (
                activities.map((activity, index) => (
                  <Box key={activity.label || index} className={cx('metricBox')}>
                    <Typography>{activity.label || activity.name || '-'}</Typography>
                    <Typography className={cx('metricValue')}>{activity.value || activity.count || 0}</Typography>
                    <LinearProgress variant="determinate" value={Number(activity.progress || 0)} className={cx('metricBar', activity.type || 'post')} />
                  </Box>
                ))
              ) : (
                <Box className={cx('metricBox')}>
                  <Typography>Chưa có dữ liệu</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
