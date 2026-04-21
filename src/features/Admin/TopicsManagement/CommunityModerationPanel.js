import { useState } from 'react';
import { Alert, Box, Button, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Tooltip } from '@mui/material';
import { GavelRounded, DeleteSweepRounded, VisibilityOffRounded, ForumRounded, ArticleRounded, BugReportRounded, ShieldRounded, AddModeratorRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import { useEffect } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Moderation.module.scss';

const cx = classNames.bind(styles);

export default function CommunityModerationPanel() {
  const [reports, setReports] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await adminService.getReports('');
        const data = response?.result || response?.data || response || [];
        setReports(Array.isArray(data) ? data : data.items || data.reports || []);
      } catch {
        setReports([]);
      }
    };

    loadReports();
  }, []);

  const resolveReport = async (id, action) => {
    try {
      await adminService.resolveReport(id, action);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setNotice(`Đã thực thi hành động: ${action.toUpperCase()} trên mã báo cáo ${id}.`);
      setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Không thể xử lý báo cáo.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'post':
        return <ArticleRounded fontSize="small" />;
      case 'comment':
        return <ForumRounded fontSize="small" />;
      case 'reaction':
        return <BugReportRounded fontSize="small" />;
      default:
        return <ShieldRounded fontSize="small" />;
    }
  };

  return (
    <div className={cx('moderationWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Trung tâm Kiểm duyệt</Typography>
          <Typography className={cx('subTitle')}>Lọc nội dung bẩn, xử lý báo cáo và ngăn chặn bot lạm dụng hệ thống.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddModeratorRounded />} className={cx('policyBtn')}>
          Cấu hình bộ lọc tự động
        </Button>
      </Box>

      {notice && (
        <Alert severity="info" className={cx('alert')} icon={<GavelRounded />}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, sm: 8 }}>
          <Paper className={cx('mainPaper')} elevation={0}>
            <div className={cx('paperHeader')}>
              <Typography className={cx('paperTitle')}>
                <GavelRounded /> Hàng chờ xử lý (Pending Reports)
              </Typography>
              <Chip label={`${reports.length} Yêu cầu`} size="small" className={cx('countChip')} />
            </div>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={cx('headCell')}>Đối tượng</TableCell>
                    <TableCell className={cx('headCell')}>Nội dung / Mục tiêu</TableCell>
                    <TableCell className={cx('headCell')}>Mức độ</TableCell>
                    <TableCell className={cx('headCell')} align="right">
                      Quyết định
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id} className={cx('tableRow')}>
                      <TableCell>
                        <Box className={cx('typeBox')}>
                          <span className={cx('icon', r.type)}>{getTypeIcon(r.type)}</span>
                          <Typography fontWeight={700} fontSize="1.3rem">
                            {(r.type || r.targetType || 'report').toUpperCase()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {r.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography className={cx('targetText')}>{r.target || r.title || '-'}</Typography>
                        <Typography variant="caption" className={cx('reasonText')}>
                          Lý do: {r.reason || r.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={r.severity || 'medium'} className={cx('severityChip', r.severity || 'medium')} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Xóa vĩnh viễn">
                            <IconButton color="error" className={cx('actionBtn')} onClick={() => resolveReport(r.id, 'remove')}>
                              <DeleteSweepRounded />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Bỏ qua / Hợp lệ">
                            <IconButton color="primary" className={cx('actionBtn')} onClick={() => resolveReport(r.id, 'ignore')}>
                              <VisibilityOffRounded />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item size={{ xs: 12, sm: 4 }}>
          <Stack spacing={3}>
            <Paper className={cx('sidePaper')} elevation={0}>
              <Typography className={cx('sideTitle')}>Điều phối nội dung</Typography>
              <Typography className={cx('sideDesc')}>Quản lý cấu trúc cây chủ đề và phê duyệt bài viết từ Mod.</Typography>
              <Stack spacing={1.5} mt={2}>
                <Button fullWidth variant="outlined" className={cx('sideBtn')}>
                  Thêm chủ đề mới
                </Button>
                <Button fullWidth variant="outlined" className={cx('sideBtn')}>
                  Phê duyệt bài viết (12)
                </Button>
              </Stack>
            </Paper>

            <Paper className={cx('sidePaper', 'abuseAlert')} elevation={0}>
              <Box display="flex" alignItems="center" gap={1}>
                <BugReportRounded />
                <Typography fontWeight={800}>Abuse Detector</Typography>
              </Box>
              <Typography className={cx('sideDesc')} mt={1}>
                Phát hiện 2 cụm Bot đang spam Like tại bộ truyện: <b>"Huyết Kiếm"</b>.
              </Typography>
              <Button fullWidth className={cx('banBtn')}>
                Xử lý cụm Bot
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}
