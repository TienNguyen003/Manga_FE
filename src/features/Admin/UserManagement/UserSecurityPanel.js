/**
 * UserSecurityPanel — active sessions & suspicious-activity monitoring.
 *
 * Endpoints used (the only security endpoints the backend actually exposes):
 *   GET /admin/security/audit-logs?page=&limit=
 *   GET /admin/security/events?page=&limit=
 *   GET /admin/security/suspicious?userId=
 *
 * The previous calls to `/admin/security/sessions` and
 * `/admin/security/follow-flags` do NOT exist server-side, so they always 404'd
 * and the board rendered empty.
 */
import { AdminPanelSettingsRounded, CleaningServicesRounded, LogoutRounded, PhishingRounded, SecurityRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';

import { unwrapList } from '~/lib/httpRequest';
import { adminService } from '~/services/adminService';
import styles from './UserSecurity.module.scss';

const cx = classNames.bind(styles);

export default function UserSecurityPanel() {
  const [sessions, setSessions] = useState([]);
  const [followFlags, setFollowFlags] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSecurity = async () => {
      try {
        // Rule 1: one `data` hop, then `result`. The old
        // `res?.result || res?.data || res || []` chain hid failures behind [].
        const [logsRes, suspiciousRes] = await Promise.all([
          adminService.getSecurityAuditLogs({ page: 0, limit: 50 }),
          adminService.getSuspiciousUsers({}),
        ]);

        if (cancelled) return;
        setSessions(unwrapList({ data: logsRes.data }));
        setFollowFlags(unwrapList({ data: suspiciousRes.data }));
      } catch {
        if (cancelled) return;
        setSessions([]);
        setFollowFlags([]);
      }
    };

    loadSecurity();
    return () => {
      cancelled = true;
    };
  }, []);


  /**
   * Force a password reset on a flagged account.
   *
   * ⚠️ The backend exposes no "terminate session" endpoint, so the previous
   * `adminService.terminateSession` call always 404'd. Resetting the password
   * is the real revocation lever available today: the user's current token stops
   * working once the password changes.
   */
  const revokeAccess = async (userId) => {
    try {
      await adminService.resetUserPassword(userId, {});
      setNotice(`Đã yêu cầu đặt lại mật khẩu cho tài khoản #${userId}.`);
      setTimeout(() => setNotice(''), 4000);
    } catch {
      setNotice('Không thể thu hồi quyền truy cập của tài khoản này.');
      setTimeout(() => setNotice(''), 4000);
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
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="textSecondary">
                          Chưa có nhật ký bảo mật nào.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((s) => (
                      <TableRow key={s.id ?? `${s.username}-${s.action}-${s.at}`} className={cx('tableRow')}>
                        <TableCell>
                          <Typography fontWeight={800} color="primary">
                            {s.username || s.user || s.userId || '-'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {s.action || s.event || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize="1.3rem" fontWeight={600}>
                              {s.ip || s.ipAddress || '-'}
                            </Typography>
                            {s.device && (
                              <Chip label={s.device} size="small" variant="outlined" sx={{ fontSize: '1rem' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.risk || s.severity || 'thấp'}
                            className={cx('riskChip', String(s.risk || s.severity || 'thấp').replace(' ', '-'))}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {s.userId && (
                            <Tooltip title="Đặt lại mật khẩu (thu hồi quyền truy cập)">
                              <Button color="error" size="small" onClick={() => revokeAccess(s.userId)}>
                                Thu hồi
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
