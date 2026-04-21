import { AnalyticsRounded, AutoModeRounded, ErrorOutlineRounded, FactCheckRounded, PersonSearchRounded, RestoreRounded } from '@mui/icons-material';
import SourceIcon from '@mui/icons-material/Source';
import { Alert, Box, Button, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './CollectionAudit.module.scss';

const cx = classNames.bind(styles);

export default function CollectionAuditPanel() {
  const [cases, setCases] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await adminService.getCollectionAuditCases('');
        const data = response?.result || response?.data || response || [];
        setCases(Array.isArray(data) ? data : data.items || data.cases || []);
      } catch {
        setCases([]);
      }
    };

    loadCases();
  }, []);

  const resolveCase = async (id) => {
    try {
      await adminService.updateCollectionAuditCase(id, { status: 'resolved' });
      setCases((prev) => prev.filter((c) => c.id !== id));
      setNotice(`Ticket ${id} đã được đóng. Dữ liệu đã được kiểm toán.`);
      setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Không thể xử lý ticket kiểm toán.');
    }
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
              <Grid size={{ xs: 12 }} key={c.id}>
                <Paper className={cx('caseCard', c.level)} elevation={0}>
                  {/* Header: Gom ID, Time và Title lại để tạo cảm giác chuyên nghiệp */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Stack spacing={0.5} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                      <Typography className={cx('idTag')}>#{c.id}</Typography>
                      <Typography className={cx('collectionName')}>{c.collectionName}</Typography>
                    </Stack>
                    <Typography className={cx('timeTag')}>{new Date(c.createdAt).toLocaleString()}</Typography>
                  </Box>

                  {/* Body: Chỉ chứa thông tin User và Vi phạm */}
                  <Box className={cx('content')}>
                    <Box className={cx('userInfo')}>
                      <PersonSearchRounded sx={{ fontSize: 20 }} />
                      <Typography fontWeight={700} fontSize="1.3rem">
                        {c.user || c.username || 'Unknown'}
                      </Typography>
                    </Box>

                    <Box className={cx('violationWrapper')}>
                      <SourceIcon sx={{ fontSize: 20 }} />
                      <Typography className={cx('violationLabel')}>Vi phạm: {c.violationReason || 'Không có'}</Typography>
                    </Box>
                  </Box>

                  <Divider className={cx('divider')} />

                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" startIcon={<RestoreRounded />} className={cx('restoreBtn')}>
                      Khôi phục
                    </Button>
                    <Button variant="outlined" onClick={() => resolveCase(c.id)} className={cx('resolveBtn')}>
                      Xử lý
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
