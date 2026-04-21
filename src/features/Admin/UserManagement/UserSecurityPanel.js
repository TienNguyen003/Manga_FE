import { AdminPanelSettingsRounded, CleaningServicesRounded, LogoutRounded, PhishingRounded, SecurityRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './UserSecurity.module.scss';

const cx = classNames.bind(styles);

export default function UserSecurityPanel() {
  const [sessions, setSessions] = useState([]);
  const [followFlags, setFollowFlags] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        const [sessionsRes, flagsRes] = await Promise.all([adminService.getSessions(''), adminService.getFollowFlags('')]);
        const sessionsData = sessionsRes?.result || sessionsRes?.data || sessionsRes || [];
        const flagsData = flagsRes?.result || flagsRes?.data || flagsRes || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData.items || sessionsData.sessions || []);
        setFollowFlags(Array.isArray(flagsData) ? flagsData : flagsData.items || flagsData.flags || []);
      } catch {
        setSessions([]);
        setFollowFlags([]);
      }
    };

    loadSecurity();
  }, []);

  const forceLogout = async (id) => {
    try {
      await adminService.terminateSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setNotice(`Phiên đăng nhập ${id} đã bị ngắt kết nối bắt buộc.`);
      setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Không thể ngắt phiên đăng nhập.');
    }
  };

  return (
    <div className={cx('securityWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Bảo mật & Phiên đăng nhập</Typography>
          <Typography className={cx('subTitle')}>Giám sát truy cập thời gian thực và ngăn chặn hành vi lạm dụng tài khoản.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AdminPanelSettingsRounded />} className={cx('actionBtn')}>
          Quản lý danh sách Ban
        </Button>
      </Box>

      {notice && (
        <Alert severity="warning" variant="filled" className={cx('alert')} icon={<LogoutRounded />}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quản lý phiên đăng nhập */}
        <Grid item size={{ xs: 12, sm: 7 }}>
          <Paper className={cx('mainPaper')} elevation={0}>
            <div className={cx('paperHeader')}>
              <Typography className={cx('paperTitle')}>
                <SecurityRounded /> Phiên đăng nhập hoạt động
              </Typography>
              <Chip label={sessions.length} size="small" className={cx('countChip')} />
            </div>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={cx('headCell')}>Người dùng</TableCell>
                    <TableCell className={cx('headCell')}>Thông tin truy cập</TableCell>
                    <TableCell className={cx('headCell')}>Rủi ro</TableCell>
                    <TableCell align="right" className={cx('headCell')}>
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id} className={cx('tableRow')}>
                      <TableCell>
                        <Typography fontWeight={800} color="primary">
                          {s.user || s.username || '-'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {s.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontSize="1.3rem" fontWeight={600}>
                            {s.ip || s.ipAddress || '-'}
                          </Typography>
                          <Chip label={s.device || s.deviceInfo || '-'} size="small" variant="outlined" sx={{ fontSize: '1rem' }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={s.risk || s.severity || 'thấp'} className={cx('riskChip', String(s.risk || s.severity || 'thấp').replace(' ', '-'))} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ngắt kết nối ngay">
                          <IconButton color="error" onClick={() => forceLogout(s.id)} className={cx('logoutBtn')}>
                            <LogoutRounded />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Cảnh báo Bot/Follow Abuse */}
        <Grid item size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Paper className={cx('sidePaper', 'flagBoard')} elevation={0}>
              <Box className={cx('sideHeader')}>
                <PhishingRounded color="error" />
                <Typography fontWeight={800} ml={1}>
                  Báo động Follow Abuse
                </Typography>
              </Box>

              <Stack spacing={1.5} mt={2}>
                {followFlags.map((f) => (
                  <Box key={f.id} className={cx('flagItem')}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography fontWeight={850}>{f.account || f.user || '-'}</Typography>
                      <Chip label={f.severity || 'medium'} size="small" className={cx('sevChip', f.severity || 'medium')} />
                    </Box>
                    <Typography className={cx('patternText')}>{f.pattern || f.reason || '-'}</Typography>
                    <Button size="small" className={cx('resolveBtn')}>
                      Xử lý tài khoản
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper className={cx('sidePaper', 'cleanupCard')} elevation={0}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CleaningServicesRounded />
                <Typography fontWeight={800}>Dọn dẹp hệ thống</Typography>
              </Box>
              <Typography fontSize="1.3rem" color="#94a3b8" mb={2}>
                Tự động xóa các thông báo rác hoặc log lỗi đã cũ trên toàn hệ thống.
              </Typography>
              <Button fullWidth variant="contained" color="error" className={cx('clearBtn')}>
                Xóa thông báo Spam (Bulk)
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}
