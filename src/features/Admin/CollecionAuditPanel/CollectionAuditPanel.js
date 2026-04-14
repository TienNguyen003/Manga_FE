import { AnalyticsRounded, AutoModeRounded, ErrorOutlineRounded, FactCheckRounded, PersonSearchRounded, RestoreRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import styles from './CollectionAudit.module.scss';

const cx = classNames.bind(styles);

const seedCases = [
  { id: 'CL-01', user: 'reader_22', issue: 'Mất 18 manga trong bộ sưu tập', level: 'high', timestamp: '2 giờ trước' },
  { id: 'CL-02', user: 'reader_35', issue: 'Chuỗi đọc (streak) bị reset bất thường', level: 'medium', timestamp: '5 giờ trước' },
  { id: 'CL-03', user: 'reader_42', issue: 'Dữ liệu bộ sưu tập bị trùng lặp', level: 'medium', timestamp: '1 giờ trước' },
  { id: 'CL-04', user: 'reader_18', issue: 'Không thể thêm manga mới vào bộ sưu tập', level: 'high', timestamp: '3 giờ trước' },
];

export default function CollectionAuditPanel() {
  const [cases, setCases] = useState(seedCases);
  const [notice, setNotice] = useState('');

  const resolveCase = (id) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
    setNotice(`Ticket ${id} đã được đóng. Dữ liệu đã được kiểm toán.`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className={cx('auditWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Kiểm toán & Phục hồi dữ liệu</Typography>
          <Typography className={cx('subTitle')}>Xử lý sự cố đồng bộ, mất dữ liệu bộ sưu tập và điều tra hành vi bất thường.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AnalyticsRounded />} className={cx('statsBtn')}>
          Analytics Tổng thể
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" variant="filled" className={cx('alert')} icon={<FactCheckRounded />}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Danh sách ticket sự cố */}
        <Grid item size={{ xs: 12, sm: 8 }}>
          <Grid container spacing={2}>
            {cases.map((c) => (
              <Grid item size={{ xs: 12 }} key={c.id}>
                <Paper className={cx('caseCard', c.level)} elevation={0}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography className={cx('idTag')}>{c.id}</Typography>
                      <Typography className={cx('timeTag')}>{c.timestamp}</Typography>
                    </Stack>
                    <Chip label={c.level.toUpperCase()} className={cx('levelChip', c.level)} size="small" />
                  </Box>

                  <Box className={cx('content')}>
                    <Box className={cx('userInfo')}>
                      <PersonSearchRounded />
                      <Typography fontWeight={800}>{c.user}</Typography>
                    </Box>
                    <Typography className={cx('issueText')}>{c.issue}</Typography>
                  </Box>

                  <Divider className={cx('divider')} />

                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" startIcon={<RestoreRounded />} className={cx('restoreBtn')}>
                      Khôi phục dữ liệu
                    </Button>
                    <Button variant="outlined" onClick={() => resolveCase(c.id)} className={cx('resolveBtn')}>
                      Xác nhận xử lý
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Panel Giám sát Abuse */}
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Stack spacing={3}>
            <Paper className={cx('sidePaper', 'monitorCard')} elevation={0}>
              <Typography className={cx('sideTitle')}>Phát hiện Abuse</Typography>
              <Typography className={cx('sideDesc')}>Hệ thống đang theo dõi các hành vi spam Collection để tạo rating ảo.</Typography>

              <Stack spacing={2} mt={3}>
                <Box className={cx('statRow')}>
                  <Typography>Spam Collection</Typography>
                  <Chip label="0 detected" size="small" color="success" />
                </Box>
                <Box className={cx('statRow')}>
                  <Typography>Streak Manipulation</Typography>
                  <Chip label="2 flags" size="small" color="warning" />
                </Box>
              </Stack>

              <Button fullWidth variant="outlined" startIcon={<AutoModeRounded />} className={cx('autoBtn')}>
                Quét tự động toàn sàn
              </Button>
            </Paper>

            <Paper className={cx('sidePaper', 'helpCard')} elevation={0}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ErrorOutlineRounded />
                <Typography fontWeight={800}>Lưu ý kiểm toán</Typography>
              </Box>
              <Typography className={cx('helpText')}>
                Mọi hành động khôi phục dữ liệu sẽ được ghi lại trong <b>System Logs</b>. Hãy đảm bảo đã xác minh danh tính user trước khi thực hiện.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}
